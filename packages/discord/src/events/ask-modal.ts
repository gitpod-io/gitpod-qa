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

            const { answer, sources } = await props.search(question);

            const formatted_question = question
                .trim()
                .split('\n')
                .map((line) => `> ${line}`)
                .join('\n');

            const formatted_sources = sources.join('\n');

            const response = `${formatted_question}\n${answer}\n\nSources:\n${formatted_sources}`;

            interaction.followUp({
                content: response,
            });
        }
    },
});
