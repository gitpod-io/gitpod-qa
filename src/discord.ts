import { IntentsBitField, ModalBuilder, ActionRowBuilder } from 'discord.js';
import type { ModalActionRowComponentBuilder } from 'discord.js';
import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { JellyCommands, command } from 'jellycommands';
import { createSearch } from './search';

const search = await createSearch();

const ask = command({
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
            .setMinLength(30)
            .setMaxLength(2000);

        const row =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                question_input,
            );

        modal.addComponents(row);

        interaction.showModal(modal);
    },
});

const client = new JellyCommands({
    // @ts-ignore will fix this
    commands: [ask],

    clientOptions: {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildVoiceStates,
        ],
    },

    dev: {
        global: true,
        guilds: ['663140687591768074'],
    },
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isModalSubmit() && interaction.customId == 'ask-modal') {
        await interaction.deferReply();

        const question = interaction.fields.getTextInputValue('question');

        if (question.trim().length == 0) {
            await interaction.followUp({
                content: 'Please give a question',
            });

            return;
        }

        const { answer, sources } = await search(question);

        const formatted_question = question
            .trim()
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n');

        const formatted_sources = sources.join('\n');

        const response = `${formatted_question}\n${answer}\n\nSources:\n${formatted_sources}`;

        console.log(response);

        interaction.followUp({
            content: response,
        });
    }
});

client.on('ready', () => {
    console.log('ready');
});

client.login();
