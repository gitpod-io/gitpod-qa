import { generate_answer } from '../lib/qa';
import { ChannelType } from 'discord.js';
import { button } from 'jellycommands';

function limit_chars(str: string) {
    return str.length > 2000 ? `${str.slice(0, 2000)}...` : str;
}

export default button({
    id: 'question-qa',

    defer: true,

    async run({ interaction, client, props }) {
        const channel = await client.channels.fetch(interaction.channelId);

        if (!channel)
            return interaction.followUp({
                content: 'Unable to find the channel you are in',
            });

        if (channel.type != ChannelType.PublicThread)
            return interaction.followUp({
                content: 'Not in a thread',
            });

        const startMessage = await channel.fetchStarterMessage();

        if (!startMessage)
            return interaction.followUp({
                content: 'Unable to fetch question',
            });

        const question = `${channel.name.trim()}\n${startMessage.content.trimStart()}`;

        const answer = await generate_answer(
            limit_chars(question),
            props.qabox,
        );

        return interaction.followUp({
            content: answer,
        });
    },
});
