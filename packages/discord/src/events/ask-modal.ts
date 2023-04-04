import { create_error_response, create_response } from '../lib/response';
import { event } from 'jellycommands';

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
                return;
            }

            // The prompt template instructs it to return "I don't know" if it doesn't know, so we should exit
            if (answer == "I don't know.") {
                await interaction.followUp({
                    content: create_error_response(question),
                });

                return;
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
