import { marked } from 'marked';

const block = (text: string) => text + '\n\n';
const line = (text: string) => text + '\n';
const inline = (text: string) => text;
const newline = () => '\n';
const empty = () => '';

const TextRenderer: marked.Renderer = {
    code: (text, lang) => `\`\`\`${lang}\n${text}\n\`\`\`\n\n`,
    blockquote: (text) => `${text}`,
    html: empty,
    heading: (text, level) => {
        const split = '__SPLIT_HERE__';

        return [1, 2].includes(level)
            ? `${split}\n${block(text)}`
            : block(text);
    },
    hr: newline,
    list: (text) => block(text.trim()),
    listitem: line,
    checkbox: empty,
    paragraph: block,
    table: (header, body) => line(header + body),
    tablerow: (text) => line(text.trim()),
    tablecell: (text) => text + ' ',
    // Inline elements
    strong: inline,
    em: inline,
    codespan: inline,
    br: newline,
    del: inline,
    link: (_0, _1, text) => text,
    image: (_0, _1, text) => text,
    text: inline,
    // etc.
    options: {},
};

export function markdownToText(md: string) {
    // Remove frontmatter
    const sanitisedMd = md.replace(/^---[\s\S]+?---/, '');

    const result = marked(sanitisedMd, {
        renderer: TextRenderer,
    });

    return result.trim();
}
