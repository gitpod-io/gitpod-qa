import { OpenAIEmbeddings } from 'langchain/embeddings';
import { loadQAStuffChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores';
import { Document } from 'langchain/document';
import { getDocuments } from './documents';
import { OpenAI } from 'langchain/llms';
import { config } from './config';
import { existsSync } from 'fs';
import { join } from 'desm';

const SEARCH_PATH = join(
    import.meta.url,
    `../search-index/${config.searchIndex}`,
);

const TEMP_PATH = join(import.meta.url, '../temp');

async function generateSearchIndex(documents: Document[]) {
    const search = await HNSWLib.fromDocuments(
        documents,
        new OpenAIEmbeddings(),
    );

    await search.save(SEARCH_PATH);

    return search;
}

let search: HNSWLib;

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

const documents = await search.similaritySearch(config.question, 4);

const result = await chain.call({
    input_documents: documents,
    question: config.question,
});

const answer = result.text;

console.log({ answer });
