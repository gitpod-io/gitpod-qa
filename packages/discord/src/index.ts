import { createSearch } from '@gitpod/docs-qa';
import { JellyCommands } from 'jellycommands';
import { IntentsBitField } from 'discord.js';

const search = await createSearch();

const client = new JellyCommands({
    commands: 'src/commands',
    events: 'src/events',

    clientOptions: {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildVoiceStates,
        ],
    },

    props: {
        search,
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
