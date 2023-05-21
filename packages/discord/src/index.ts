import { JellyCommands } from 'jellycommands';
import { IntentsBitField } from 'discord.js';
import { getQABox } from '@gitpod/docs-qa';
import 'dotenv/config';

const client = new JellyCommands({
    buttons: 'src/buttons',
    events: 'src/events',

    clientOptions: {
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildVoiceStates,
        ],
    },

    props: {
        qabox: await getQABox(),
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
