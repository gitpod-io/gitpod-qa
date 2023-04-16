import { stripIndents } from 'common-tags';

function format_question(question: string) {
    const formatted = question
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
        .slice(0, 1000)
        .trim();

    return formatted.length == 1000 ? `${formatted}...` : formatted;
}

interface ResponseData {
    question: string;
    answer: string;
    sources: string[];
}

export function create_response(data: ResponseData) {
    return stripIndents`
        ${format_question(data.question)}
        ${data.answer}

        Sources:
        ${data.sources.join('\n')}

        Please note while I am in beta my answer my not be 100% accurate
    `;
}

export function create_error_response(question: string) {
    return stripIndents`
        ${format_question(question)}
        I don't have enough information to answer that right now :(
    `;
}
