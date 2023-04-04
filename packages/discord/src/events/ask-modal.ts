import { event } from 'jellycommands';

const format_question = (question: string) => {
    const formatted = question
        .trim()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
        .slice(0, 1000)
        .trim();

    return formatted.length == 1000 ? `${formatted}...` : formatted;
};

interface ResponseData {
    question: string;
    answer: string;
    sources: string[];
}

const create_response = (data: ResponseData) => `
${format_question(data.question)}
${data.answer}

Sources:
${data.sources.join('\n')}
`;

export default event({
    name: 'interactionCreate',

    async run({ props }, interaction) {
        if (
            interaction.isModalSubmit() &&
            interaction.customId == 'ask-modal'
        ) {
            await interaction.deferReply();

            const question = interaction.fields.getTextInputValue('question');

            if (question.trim().length == 0) {
                await interaction.followUp({
                    content: 'Please give a question',
                });

                return;
            }

            const result = await props.search(question);

            const sources: string[] = Array.isArray(result?.sources)
                ? result.sources
                : [];

            const answer =
                typeof result?.answer == 'string' ? result.answer : null;

            if (!answer || sources.length == 0) {
                await interaction.followUp({
                    content: 'There was an error generating an answer',
                });
            }

            interaction.followUp({
                content: create_response({
                    question,
                    sources,
                    answer,
                }),
            });
        }
    },
});
