import { create_error_response, create_response } from './response';
import type { QASearcher } from '@gitpod/docs-qa';

export async function generate_answer(question: string, search: QASearcher) {
    const { answer, sources } = await search(question);

    if (sources.length == 0) {
        return 'There was an error generating an answer';
    }

    // The prompt template instructs it to return "I don't know" if it doesn't know, so we should exit
    if (answer == "I don't know.") return create_error_response(question);

    return create_response({
        question,
        sources,
        answer,
    });
}
