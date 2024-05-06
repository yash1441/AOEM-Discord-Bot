const { EmbedBuilder, ActionRowBuilder, inlineCode, bold, italic, blockQuote } = require('discord.js');
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
        const thread = interaction.channel;
        await interaction.update({ components: [endConversation] });

        let timedOut = false;
        const userData = {
            discordId: interaction.user.id,
            discordUsername: interaction.user.username,
        }

        const collectorFilter = m => interaction.user.id === m.author.id;

        await thread.send({ content: blockQuote(bold('Firstly, please provide your Governor ID.\n')) + italic('(Only text message can be recorded)') });

        await thread.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.governorId = messages.first().content;
            thread.send({ content: 'Received. Next question.' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            try {
                await thread.send({ content: bold('You did not provide your Governor ID in time. This thread will be deleted.') });
                setTimeout(function () {
                    thread.delete().catch();
                }, 2_000);
            } catch {
                console.log('Thread already deleted.');
            }
            return;
        }

        await thread.send({ content: blockQuote(bold('Please give a detailed description of the problem you have encountered, preferably with a screenshot to help us quickly determine the root cause of the problem.')) });

        await thread.awaitMessages({
            filter: collectorFilter,
            time: 4_20_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.details = (messages.first().content) ? messages.first().content : "-";

            const attachment = messages.first().attachments.first();
            if (attachment && attachment.contentType.includes('image')) userData.screenshot = attachment.proxyURL;

            thread.send({ content: 'Thanks a lot for your feedback. Now, we need collect some basic information.' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            try {
                await thread.send({ content: bold('You did not provide detailed description in time. This thread will be deleted.') });
                setTimeout(function () {
                    thread.delete().catch();
                }, 2_000);
            } catch {
                console.log('Thread already deleted.');
            }
            return;
        }

        await thread.send({ content: blockQuote(bold('Please provide your device model, operating system, and game version in a single message.\n')) + italic('(Only text message can be recorded)') });

        await thread.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.deviceInfo = (messages.first().content) ? messages.first().content : "-";
            thread.send({ content: 'Received. One last question!' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            try {
                await thread.send({ content: bold('You did not provide device info in time. This thread will be deleted.') });
                setTimeout(function () {
                    thread.delete().catch();
                }, 2_000);
            } catch {
                console.log('Thread already deleted.');
            }
            return;
        }

        await thread.send({ content: blockQuote(bold('What time did this issue occur (server time, UTC+0)? Is it mandatory or occasional?\n')) + italic('(Only text message can be recorded)') });

        await thread.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.timeOfOccurence = (messages.first().content) ? messages.first().content : "-";
            thread.send({ content: 'Thanks for your patience. Your feedback is important for the smooth operation of the game. If the problem you reported is verified to be genuine, the official will provide you a reward in the future.' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            try {
                await thread.send({ content: bold('You did not provide time of occurence in time. This thread will be deleted.') });
                setTimeout(function () {
                    thread.delete().catch();
                }, 2_000);
            } catch {
                console.log('Thread already deleted.');
            }
            return;
        }

        if (!userData.governorId) userData.governorId = '-';
        if (!userData.details) userData.details = '-';
        if (!userData.deviceInfo) userData.deviceInfo = '-';
        if (!userData.timeOfOccurence) userData.timeOfOccurence = '-';

        const embed = new EmbedBuilder()
            .setTitle('Bug Report')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(bold('Details') + '\n' + userData.details)
            .addFields(
                { name: 'Governor ID', value: inlineCode(userData.governorId) },
                { name: 'Device Info', value: userData.deviceInfo },
                { name: 'Time of Occurence', value: userData.timeOfOccurence }
            )
            .setColor('Red')
            .setTimestamp();

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

        await thread.send({ content: bold('This thread will be deleted in 10 seconds.') });

        setTimeout(function () {
            thread.delete().catch();
        }, 10_000);
    },
};