import { OpenAIEmbeddings } from 'langchain/embeddings';
import { loadQAMapReduceChain } from 'langchain/chains';
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

async function getSearchIndex() {
    let search: HNSWLib;

    if (existsSync(SEARCH_PATH)) {
        console.log('Using existing search index');
        search = await HNSWLib.load(SEARCH_PATH, new OpenAIEmbeddings());
    } else {
        console.log('Building new search index');

        const documents = await getDocuments();

        search = await HNSWLib.fromDocuments(documents, new OpenAIEmbeddings());

        await search.save(SEARCH_PATH);
    }

    return search;
}

export async function createSearch() {
    const chain = loadQAMapReduceChain(new OpenAI({ temperature: 0 }));
    const search = await getSearchIndex();

    return async (question: string) => {
        const documents = await search.similaritySearch(question, 4);

        const result = await chain.call({
            input_documents: documents,
            question,
        });

        const answer = result?.text?.trim();

        return typeof answer == 'string' ? answer : 'Error getting response';
    };
}
