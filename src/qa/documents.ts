import {
    CharacterTextSplitter,
    RecursiveCharacterTextSplitter,
} from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { markdownToText } from './marked';
import { simpleGit } from 'simple-git';
import { readFile } from 'fs/promises';
import { totalist } from 'totalist';
import { existsSync } from 'fs';
import { join } from 'desm';

const TEMP_PATH = join(import.meta.url, '../temp');

// TODO designed for splitting markdown but should be better
export async function splitDocuments(documents: Document[]) {
    const splitter = new CharacterTextSplitter({
        separator: '__SPLIT_HERE__',
        chunkSize: 4000,
    });

    const splitDocuments: Document[] = [];

    for (const document of documents) {
        const chunks = await splitter.splitText(document.pageContent);

        for (const chunk of chunks) {
            if (chunk.length > 4000) {
                const secondarySplitter = new RecursiveCharacterTextSplitter();
                const chunks = await secondarySplitter.splitText(chunk);

                for (const chunk of chunks) {
                    const splitDocument = new Document({
                        metadata: document.metadata,
                        pageContent: chunk,
                    });

                    splitDocuments.push(splitDocument);
                }
            } else {
                const splitDocument = new Document({
                    metadata: document.metadata,
                    pageContent: chunk,
                });

                splitDocuments.push(splitDocument);
            }
        }
    }

    return splitDocuments;
}

export async function getDocuments() {
    const repoPath = `${TEMP_PATH}/gitpod`;

    if (!existsSync(repoPath)) {
        console.log('Cloning Gitpod Repo');

        await simpleGit().clone(
            'https://github.com/gitpod-io/website',
            repoPath,
            {
                '--depth': 1,
            },
        );
    }

    interface Path {
        path: string;
        name: string;
    }

    const paths: Path[] = [];

    console.log('Finding MD files');
    await totalist(repoPath, (relative, path) => {
        if (!path.endsWith('.md') || !relative.startsWith('src/routes')) return;

        const name = relative.replace('src/routes', '').slice(0, -3);

        paths.push({ path, name });
    });

    const documents: Document[] = [];

    console.log('Generating documents');
    for (const { path, name } of paths) {
        const rawContents = await readFile(path, 'utf-8');
        const url = `https://gitpod.io${name}`;

        const contents = markdownToText(rawContents);

        const document = new Document({
            metadata: { source: url },
            pageContent: contents,
        });

        documents.push(document);
    }

    return splitDocuments(documents);
}
