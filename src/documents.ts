import { CharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { config } from './config';

export async function splitDocuments(documents: Document[]) {
    const splitDocuments: Document[] = [];

    const splitter = new CharacterTextSplitter({
        chunkOverlap: 0,
        separator: ' ',
        chunkSize: 1024,
    });

    for (const document of documents) {
        const chunks = await splitter.splitText(document.pageContent);

        for (const chunk of chunks) {
            const splitDocument = new Document({
                metadata: document.metadata,
                pageContent: chunk,
            });

            splitDocuments.push(splitDocument);
        }
    }

    return splitDocuments;
}

export async function getDocuments() {
    let documents: Document[] = [];

    switch (config.searchIndex) {
        case 'wikipedia':
            documents = await getWikipediaDocuments();
            break;
    }

    return splitDocuments(documents);
}

async function getWikipediaDocuments() {
    const documents: Document[] = [];

    const titles: string[] = [
        'Unix',
        'Microsoft_Windows',
        'Linux',
        'London',
        'Python_(programming_language)',
    ];

    for (const title of titles) {
        const url = `https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=1&titles=${title}`;
        const response = await fetch(url);
        const data = await response.json();

        const [page] = Object.values(data.query.pages) as Record<string, any>[];

        const document = new Document({
            pageContent: page.extract,
            metadata: {
                source: `https://en.wikipedia.org/wiki/${title}`,
            },
        });

        documents.push(document);
    }

    return documents;
}
