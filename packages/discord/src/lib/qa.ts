import { create_error_response, create_response } from './response';
import type { QASearcher } from '@gitpod/docs-qa';

export async function generate_answer(question: string, search: QASearcher) {
    const result = await search(question);

    const sources: string[] = Array.isArray(result?.sources)
        ? // TODO remove the map next time the search index is rebuilt
          result.sources.map((source) => source.replace(/\/index$/gm, '/'))
        : [];

    const answer = typeof result?.answer == 'string' ? result.answer : null;

    if (!answer || sources.length == 0)
        return 'There was an error generating an answer';

    // The prompt template instructs it to return "I don't know" if it doesn't know, so we should exit
    if (answer == "I don't know.") return create_error_response(question);

    return create_response({
        question,
        sources,
        answer,
    });
}
