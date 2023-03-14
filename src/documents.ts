import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import MarkedText from 'marked-renderer-text';
import { simpleGit } from 'simple-git';
import { readFile } from 'fs/promises';
import { totalist } from 'totalist';
import { config } from './config';
import { marked } from 'marked';
import { existsSync } from 'fs';
import { join } from 'desm';

const TEMP_PATH = join(import.meta.url, '../temp');

// TODO code blocks cause text to split when it shouldn't
export async function splitDocuments(documents: Document[]) {
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocuments: Document[] = [];

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

        case 'gitpod':
            documents = await getGitpodDocuments();
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

export async function getGitpodDocuments() {
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

    const renderer = new MarkedText();
    const documents: Document[] = [];

    console.log('Generating documents');
    for (const { path, name } of paths) {
        const rawContents = await readFile(path, 'utf-8');
        const url = `https://gitpod.io${name}`;

        // Remove the frontmatter then parse the markdown to text
        const contents = marked(rawContents.replace(/^---[\s\S]+?---/, ''), {
            renderer,
        });

        const document = new Document({
            metadata: { source: url },
            pageContent: contents,
        });

        documents.push(document);
    }

    return documents;
}
