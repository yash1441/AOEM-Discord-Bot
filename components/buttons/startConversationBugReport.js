const { EmbedBuilder, ActionRowBuilder, inlineCode } = require('discord.js');
const date = require('date-and-time');
const Sheets = require('../../utils/sheets');
const ImgBB = require('../../utils/imgbb');

require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'startConversationBugReport',
    },
    async execute(interaction) {
        const endConversation = new ActionRowBuilder().addComponents(interaction.message.components[0].components[1]);
        await interaction.update({ components: [endConversation] });

        let timedOut = false;
        const userData = {
            discordId: interaction.user.id,
            discordUsername: interaction.user.username,
        }

        const collectorFilter = m => interaction.user.id === m.author.id;

        await interaction.channel.send({ content: bold('Firstly, please provide your Governor ID. ') + italic('Only text message can be recorded') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.governorId = messages.first().content;
            interaction.channel.send({ content: italic('Received. Next question.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide your Governor ID in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: bold('Please give a detailed description of the problem you have encountered, preferably with a screenshot to help us quickly determine the root cause of the problem.') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.details = (messages.first().content) ? messages.first().content : "-";

            const attachment = messages.first().attachments.first();

            if (attachment && attachment.contentType.includes('image')) userData.screenshot = attachment.proxyURL;
            interaction.channel.send({ content: bold('Thanks a lot for your feedback. Now, we need collect some basic information.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide detailed description in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: bold('Please provide your device model, operating system, and game version in a single message. ') + italic('(Only text message can be recorded)') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.deviceInfo = (messages.first().content) ? messages.first().content : "-";
            interaction.channel.send({ content: bold('Received. One last question!') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide device info in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: bold('What time did this issue occur (server time, UTC+0)? Is it mandatory or occasional?') + italic('(Only text message can be recorded)') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.timeOfOccurence = (messages.first().content) ? messages.first().content : "-";
            interaction.channel.send({ content: bold('Thanks for your patience. Your feedback is important for the smooth operation of the game. If the problem you reported is verified to be genuine, the official will provide you a reward in the future.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide time of occurence in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        const embed = new EmbedBuilder()
            .setTitle('Bug Report')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .addFields({
                name: 'Governor ID',
                value: inlineCode(userData.governorId),
            },
                {
                    name: 'Details',
                    value: userData.details,
                },
                {
                    name: 'Device Info',
                    value: userData.deviceInfo,
                },
                {
                    name: 'Time of Occurence',
                    value: userData.timeOfOccurence,
                })
            .setColor('Red')
            .setTimestamp();

        if (!userData.governorId) userData.governorId = '-';
        if (!userData.details) userData.details = '-';
        if (!userData.deviceInfo) userData.deviceInfo = '-';
        if (!userData.timeOfOccurence) userData.timeOfOccurence = '-';

        if (userData.screenshot) {
            userData.screenshotUrl = await ImgBB(userData.screenshot);
            userData.screenshotFunction = '=HYPERLINK("' + userData.screenshotUrl + '", IMAGE("' + userData.screenshotUrl + '", 1))'
            embed.setImage(userData.screenshotUrl);
        } else {
            userData.screenshotFunction = '-'
        }

        const channel = interaction.client.channels.cache.get(process.env.BUG_CHANNEL);
        await channel.send({ embeds: [embed] });

        const now = new Date();

        await Sheets.appendRow(process.env.FEEDBACK_SHEET, 'Bug!A2:Z', [[interaction.user.id, interaction.user.username, userData.governorId, userData.details, userData.deviceInfo, userData.timeOfOccurence, date.format(now, 'MM-DD-YYYY'), userData.screenshotFunction]]);

        await interaction.channel.send({ content: 'This thread will be deleted in 10 seconds.' });

        setTimeout(function () {
            interaction.channel.delete().catch();
        }, 10_000);
    },
};