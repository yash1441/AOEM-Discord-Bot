const { EmbedBuilder, ActionRowBuilder, messageLink, inlineCode } = require('discord.js');
const date = require('date-and-time');
const Sheets = require('../../utils/sheets');
const ImgBB = require('../../utils/imgbb');

require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'startConversationTranslationIssue',
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

        await interaction.channel.send({ content: 'Firstly, please provide your Governor ID.' });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.governorId = messages.first().content;
            interaction.channel.send({ content: 'Received. Next question.' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: 'You did not provide your Governor ID in time. This thread will be deleted.' });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: 'Please give a detailed description of the problem you have encountered, preferably with screenshots and videos to help us quickly determine the root cause of the problem.' });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.details = messages.first().content;
            const attachment = messages.first().attachments.first();

            if (attachment && attachment.contentType.includes('image')) userData.screenshot = attachment.proxyURL;
            interaction.channel.send({ content: 'Thanks a lot for your feedback. Now, we need collect some basic information.' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: 'You did not provide detailed description in time. This thread will be deleted.' });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: 'Please provide your device model, operating system, and game version in a single message.' });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.deviceInfo = messages.first().content;
            interaction.channel.send({ content: 'Received. One last question!' });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: 'You did not provide detailed description in time. This thread will be deleted.' });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: 'What time did this issue occur (server time, UTC+0)? Is it mandatory or occasional? Answer in a single message.' });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.timeOfOccurence = messages.first().content;
            interaction.channel.send({ content: 'Thanks for your patience. Your feedback is important for the smooth operation of the game. If the problem you reported is verified to be genuine, the official will provide you a reward in the future.' });
        }).catch(() => {
            timedOut = true;
        });

        const embed = new EmbedBuilder()
            .setTitle('Translation Issue')
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
            .setColor('Blue')
            .setTimestamp();

        if (userData.screenshot) {
            embed.setImage(userData.screenshot);

            const imageUrl = await ImgBB(userData.screenshot);
            userData.screenshotFunction = '=HYPERLINK("' + imageUrl + '", IMAGE("' + imageUrl + '", 1))'
        } else {
            userData.screenshotFunction = '-'
        }

        const channel = interaction.client.channels.cache.get(process.env.TRANSLATION_CHANNEL);
        await channel.send({ embeds: [embed] });

        const now = new Date();

        await Sheets.appendRow(process.env.FEEDBACK_SHEET, 'Translation!A2:Z', [[interaction.user.id, interaction.user.username, userData.governorId, userData.details, userData.deviceInfo, userData.timeOfOccurence, date.format(now, 'MM-DD-YYYY'), userData.screenshotFunction ]]);

        await interaction.channel.send({ content: 'This thread will be deleted in 10 seconds.' });

        setTimeout(function () {
            interaction.channel.delete().catch();
        }, 10_000);
    },
};