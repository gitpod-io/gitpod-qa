import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { event } from 'jellycommands';

export default event({
    name: 'threadCreate',

    async run({}, channel) {
        console.log(channel.type);

        if (channel.isTextBased()) {
            const button = new ButtonBuilder()
                .setCustomId('question-qa')
                .setLabel('Ask GPT')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                button,
            );

            channel.send({
                components: [row],
            });
        }
    },
});
