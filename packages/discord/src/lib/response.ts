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
    `;
}
