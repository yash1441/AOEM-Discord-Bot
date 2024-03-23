const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, channelLink } = require('discord.js');
require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'bugReport',
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('Bug Report')
            .setDescription('Dear Governor, thank you for submitting feedback to official community! Firstly, please make sure you follow the community feedback submission rules.')
            .addFields({
                name: '❌ Account Issues', value: '(such as account loss and account unbinding)', inline: false
            },
                {
                    name: '❌ Payment Issues', value: '(payment failure or failure to receive purchased gift packages, etc.)', inline: false
                },
                {
                    name: '❌ Game Asset Losses', value: '(account hacked and destroyed, incorrect use of items, failure to receive rewards, etc.)', inline: false
                },
                {
                    name: '❌ Uncivilized Behavior Within The Game', value: '(cursing on chat channels, inappropriate game nicknames, etc.)', inline: false
                },
                {
                    name: '✅ Make suggestions on game.', value: ' ', inline: false
                },
                {
                    name: '✅ Submit experience feedback on game mechanics and gameplay events.', value: ' ', inline: false
                },
                {
                    name: '✅ Get the latest game news and update schedules.', value: ' ', inline: false
                },
                {
                    name: '✅ Get the latest community events.', value: ' ', inline: false
                },
                {
                    name: '✅ Get the gameplay guide.', value: ' ', inline: false
                },
                {
                    name: '✅ Report any illegal speech or behavior within the community.', value: ' ', inline: false
                },
                {
                    name: '✅ Report any behavior that poses a threat to game security.', value: ' ', inline: false
                },
                {
                    name: '\u200B', value: 'Please provide us with more information regarding the above types of issues, so that the community mod can provide you with further responses.', inline: false
                },
                {
                    name: '\u200B', value: 'Please note that the person responding to you include the users with Community Team (the official) and Mods role (enthusiastic players of AoE Mobile like you). Due to a large number of submissions, there may be a delay in the response. Please be patient!', inline: false
                },
                {
                    name: '\u200B', value: 'If you would like to continue, please answer some of our questions.', inline: false
                })
            .setColor('White');

        const startButton = new ButtonBuilder()
            .setLabel('Start Conversation')
            .setStyle(ButtonStyle.Success)
            .setCustomId('startConversationBugReport')
            .setEmoji('▶️');

        const endButton = new ButtonBuilder()
            .setLabel('End Conversation')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('endConversation')
            .setEmoji('🔚');

        const row = new ActionRowBuilder().addComponents(startButton, endButton);

        const thread = await interaction.channel.threads.create({
            name: 'Bug Report',
            reason: 'Interaction by ' + interaction.user.tag,
            type: ChannelType.PrivateThread,
            invitable: false
        });

        await thread.members.add(interaction.user.id);

        const message = await thread.send({ embeds: [embed], components: [row] });

        await interaction.editReply({ content: 'Dear Governor, I have created a new thread: ' + channelLink(thread.id) + ' where we can discuss your submission!' });
    },
};