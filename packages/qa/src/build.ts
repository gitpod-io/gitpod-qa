import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MarkdownTextSplitter } from 'langchain/text_splitter';
import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { TEMP_PATH, SEARCH_PATH } from './paths';
import { Document } from 'langchain/document';
import { simpleGit } from 'simple-git';
import { readFile } from 'fs/promises';
import { totalist } from 'totalist';
import { existsSync } from 'fs';

const repoPath = `${TEMP_PATH}/gitpod`;

if (!existsSync(repoPath)) {
    console.log('Cloning Gitpod Repo');

    await simpleGit().clone('https://github.com/gitpod-io/website', repoPath, {
        '--depth': 1,
    });
}

console.log('Finding MD files');

const paths: { path: string; url: string }[] = [];

await totalist(repoPath, (relative, path) => {
    if (!relative.endsWith('.md') || !relative.startsWith('src/routes')) return;

    const pathname = relative
        .replace('src/routes', '')
        .slice(0, -3)
        .replace(/\/index$/gm, '/')
        .replace(/\/$/gm, '');

    paths.push({
        url: `https://www.gitpod.io${pathname}`,
        path,
    });
});

console.log('Getting documents');

const documents: Document[] = [];

for (const { path, url } of paths) {
    const content = await readFile(path, 'utf-8');
    const splitter = new MarkdownTextSplitter();

    const docs = await splitter.createDocuments([content], [{ source: url }]);

    documents.push(...docs);
}

console.log(`Found ${documents.length} documents`);

console.log('Creating Store');

const store = await HNSWLib.fromDocuments(documents, new OpenAIEmbeddings());
store.save(SEARCH_PATH);

console.log('Done');
