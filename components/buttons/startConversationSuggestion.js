const { EmbedBuilder, ActionRowBuilder, inlineCode, bold, italic } = require('discord.js');
const date = require('date-and-time');
const Sheets = require('../../utils/sheets');
const ImgBB = require('../../utils/imgbb');

require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'startConversationSuggestion',
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
            interaction.channel.send({ content: bold('Received. Next question.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide your Governor ID in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: bold('Please give a detailed description of your feedback and suggestion, preferably with a screenshot to help us quickly locate the features or systems in your description.') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            if (!messages.first().content) userData.details = "-"
            else userData.details = messages.first().content;
            const attachment = messages.first().attachments.first();

            if (attachment && attachment.contentType.includes('image')) userData.screenshot = attachment.proxyURL;
            interaction.channel.send({ content: bold('Thanks a lot for your suggestions. Now, we need collect some basic information.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide detailed description in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }

        await interaction.channel.send({ content: bold('Could you rate the importance of the suggestions you have provided? Reference: 1 star (not important) -5 stars (very important, greatly helpful for improving game experience) ') + italic('(Only text message can be recorded)') });

        await interaction.channel.awaitMessages({
            filter: collectorFilter,
            time: 3_00_000,
            max: 1,
            errors: ['time']
        }).then(messages => {
            userData.rating = messages.first().content;
            interaction.channel.send({ content: bold('Thanks for your patience. Your feedback is important for improving the quality of the game. If your suggestions are deemed reasonable and effective, the official will provide you a reward in the future.') });
        }).catch(() => {
            timedOut = true;
        });

        if (timedOut) {
            await interaction.channel.send({ content: bold('You did not provide rating in time. This thread will be deleted.') });
            setTimeout(function () {
                interaction.channel.delete().catch();
            }, 2_000);
        }


        const embed = new EmbedBuilder()
            .setTitle('Suggestion')
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
                    name: 'Rating',
                    value: userData.rating,
                })
            .setColor('Green')
            .setTimestamp();

        if (!userData.governorId) userData.governorId = '-';
        if (!userData.details) userData.details = '-';
        if (!userData.timeOfOccurence) userData.rating = '-';

        if (userData.screenshot) {
            userData.screenshotUrl = await ImgBB(userData.screenshot);
            userData.screenshotFunction = '=HYPERLINK("' + userData.screenshotUrl + '", IMAGE("' + userData.screenshotUrl + '", 1))'
            embed.setImage(userData.screenshotUrl);
        } else {
            userData.screenshotFunction = '-'
        }

        const channel = interaction.client.channels.cache.get(process.env.SUGGESTION_CHANNEL);
        await channel.send({ embeds: [embed] });

        const now = new Date();

        await Sheets.appendRow(process.env.FEEDBACK_SHEET, 'Suggestion!A2:Z', [[interaction.user.id, interaction.user.username, userData.governorId, userData.details, userData.rating, date.format(now, 'MM-DD-YYYY'), userData.screenshotFunction]]);

        await interaction.channel.send({ content: 'This thread will be deleted in 10 seconds.' });

        setTimeout(function () {
            interaction.channel.delete().catch();
        }, 10_000);
    },
};