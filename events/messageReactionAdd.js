const { Events, bold, messageLink, inlineCode, blockQuote } = require('discord.js');
const translate = require('google-translate-api-x');
const languages = require('../utils/languages.json');
require('dotenv').config();

module.exports = {
    name: Events.MessageReactionAdd,
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                return console.error(error);
            }
        }

        if (user.id == process.env.BOT_ID || reaction.message.channelId != process.env.ANNOUNCEMENT_CHANNEL) return;

        const message = reaction.message.content;
        const language = reaction.emoji.name;

        if (!languages[language]) return;

        const translation = await translate(message, { to: languages[language] });
        const embedTranslation = await getEmbedTranslation(reaction.message, languages[language]);


        const finalTranslation = {
            text: translation.text + '\n' + (embedTranslation.text ? blockQuote(embedTranslation.text) : ''),
            from: (translation.text) ? translation.from.language.iso : embedTranslation.from
        };

        if (!finalTranslation.text || finalTranslation.text.length > 2000) return;

        await user.send({ content: bold('Translated from ' + inlineCode(finalTranslation.from) + " - ") + messageLink(reaction.message.channelId, reaction.message.id) + '\n' + finalTranslation.text });
    }
};

async function getEmbedTranslation(message, language) {
    const embed = message.embeds[0];
    if (!embed) return { text: '', from: 'en' };

    const translation = await translate(embed.description, { to: language });
    return { text: translation.text, from: translation.from.language.iso };
}