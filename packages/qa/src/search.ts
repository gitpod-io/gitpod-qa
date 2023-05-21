import { OpenAIEmbeddings } from 'langchain/embeddings';
import { HNSWLib } from 'langchain/vectorstores';
import { OpenAI } from 'langchain/llms';
import { SEARCH_PATH } from './paths';
import { QABox } from 'qabox';

export async function getQABox() {
    const store = await HNSWLib.load(SEARCH_PATH, new OpenAIEmbeddings());
    const qabox = new QABox(store, new OpenAI({ temperature: 0 }));

    return qabox;
}
