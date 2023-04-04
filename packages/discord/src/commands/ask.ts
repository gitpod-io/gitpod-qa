import { command } from 'jellycommands';
import {
    TextInputBuilder,
    TextInputStyle,
    ModalBuilder,
    ActionRowBuilder,
    type ModalActionRowComponentBuilder,
} from 'discord.js';

export default command({
    name: 'ask',
    description: 'Ask a question',

    global: true,

    async run({ interaction }) {
        const modal = new ModalBuilder()
            .setCustomId('ask-modal')
            .setTitle('Fancy question answering thing');

        const question_input = new TextInputBuilder()
            .setCustomId('question')
            .setLabel('What is your question?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMinLength(10)
            .setMaxLength(2000);

        const row =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                question_input,
            );

        modal.addComponents(row);

        interaction.showModal(modal);
    },
});
