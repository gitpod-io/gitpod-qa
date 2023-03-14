import { JellyCommands, command } from 'jellycommands';
import { IntentsBitField } from 'discord.js';
import { createSearch } from './search';

const search = await createSearch();

const ask = command({
    name: 'ask',
    description: 'Ask a question',

    options: [
        {
            name: 'question',
            description: 'The question to ask',
            type: 'String',
        },
    ],

    global: true,
    defer: true,

    async run({ interaction }) {
        const question = interaction.options.getString('question', true);
        const content = await search(question);

        interaction.followUp({ content });
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

client.on('ready', () => {
    console.log('ready');
});

client.login();
