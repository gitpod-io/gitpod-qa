import { create_error_response, create_response } from './response';
import type { QABox } from 'qabox';

export async function generate_answer(question: string, qabox: QABox) {
    const { answer, sources } = await qabox.ask(question);

    if (!answer) {
        return create_error_response(question);
    }

    return create_response({
        question,
        sources,
        answer,
    });
}
