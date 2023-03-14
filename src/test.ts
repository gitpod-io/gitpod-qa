import { getDocuments } from './documents';

const documents = await getDocuments();
console.log(documents.length);
