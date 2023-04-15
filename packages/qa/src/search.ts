import { OpenAIEmbeddings } from 'langchain/embeddings';
import { VectorDBQAChain } from 'langchain/chains';
import { HNSWLib } from 'langchain/vectorstores';
import { getDocuments } from './documents';
import { OpenAI } from 'langchain/llms';
import { SEARCH_PATH } from './paths';
import { existsSync } from 'fs';

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

export interface QASearchResult {
    sources: string[];
    answer: string;
}

export type QASearcher = (question: string) => Promise<QASearchResult>;

export async function createSearch(): Promise<QASearcher> {
    const search = await getSearchIndex();

    const chain = VectorDBQAChain.fromLLM(
        new OpenAI({ temperature: 0 }),
        search,
    );

    chain.returnSourceDocuments = true;

    return async (question) => {
        const result = await chain.call({
            finish_reason: 'stop',
            max_tokens: 500,
            query: question,
        });

        const sources = result?.sourceDocuments?.map(
            (s) => s?.metadata?.source,
        );

        const answer = result?.text?.trim();

        return {
            sources: (sources ?? []).filter(Boolean),
            answer:
                typeof answer == 'string' ? answer : 'Error getting response',
        };
    };
}
