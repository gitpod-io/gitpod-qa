import { readFileSync, writeFile, writeFileSync } from 'fs';
import { getDocuments } from './documents';
import { markdownToText } from './marked';
import { marked } from 'marked';
import { join } from 'desm';

const TEMP_PATH = join(import.meta.url, '../temp');

const documents = await getDocuments();
console.log(documents.length);

const str = readFileSync(`${TEMP_PATH}/in.md`, 'utf-8');

writeFileSync(`${TEMP_PATH}/out.txt`, markdownToText(str), 'utf-8');
