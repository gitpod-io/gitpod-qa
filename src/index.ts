import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { loadQAStuffChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores';
import { Document } from 'langchain/document';
import { OpenAI } from 'langchain/llms';
import { existsSync } from 'fs';
import { join } from 'desm';

const SEARCH_PATH = join(import.meta.url, '../search-cache');

async function getDocuments() {
    const documents: Document[] = [];

    const titles: string[] = [
        'Unix',
        'Microsoft_Windows',
        'Linux',
        'London',
        'Python_(programming_language)',
    ];

    const splitter = new CharacterTextSplitter({
        chunkOverlap: 0,
        separator: ' ',
        chunkSize: 1024,
    });

    for (const title of titles) {
        const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=1&titles=${title}`;
        const response = await fetch(url);
        const data = await response.json();

        const [page] = Object.values(data.query.pages) as Record<string, any>[];

        const chunks = await splitter.splitText(page.extract);

        for (const chunk of chunks) {
            const document = new Document({
                pageContent: chunk,
                metadata: {
                    source: `https://en.wikipedia.org/wiki/${title}`,
                },
            });

            documents.push(document);
        }
    }

    return documents;
}

async function generateSearchIndex(documents: Document[]) {
    const search = await HNSWLib.fromDocuments(
        documents,
        new OpenAIEmbeddings(),
    );

    await search.save(SEARCH_PATH);

    return search;
}

let search: HNSWLib;

console.log('Loading documents')

if (existsSync(SEARCH_PATH)) {
    console.log('Using existing search index');
    search = await HNSWLib.load(SEARCH_PATH, new OpenAIEmbeddings());
} else {
    console.log('Building new search index');
    
    const documents = await getDocuments();
    search = await generateSearchIndex(documents);
}

const chain = loadQAStuffChain(new OpenAI({ temperature: 0 }));

console.log('Loaded');

const question = 'What is Windows?'

const result = await chain.call({
    input_documents: await search.similaritySearch(question, 4),
    question,
});

const answer = result.text;