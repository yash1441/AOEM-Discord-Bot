const {
	Events,
	bold,
	messageLink,
	inlineCode,
	EmbedBuilder,
} = require("discord.js");
const translate = require("google-translate-api-x");
const languages = require("../utils/languages.json");
require("dotenv").config();

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

		if (user.id == process.env.BOT_ID) return;
		if (
			reaction.message.channelId != process.env.ANNOUNCEMENT_CHANNEL &&
			reaction.message.channelId != process.env.GENERAL_CHANNEL
		)
			return;

		const message = reaction.message.content;
		const language = reaction.emoji.name;

		if (!languages[language]) return;

		const translation = await translate(message, {
			to: languages[language],
		});
		const embedTranslation = await getEmbedTranslation(
			reaction.message,
			languages[language]
		);

		const finalTranslation = {
			text: translation.text,
			from: translation.text
				? translation.from.language.iso
				: embedTranslation.from,
		};

		if (!finalTranslation.text || finalTranslation.text.length > 2000)
			return;

		const embeds = [];

		if (embedTranslation) embeds.push(embedTranslation);

		try {
			await user.send({
				content:
					bold(
						"Translated from " +
							inlineCode(finalTranslation.from) +
							" - "
					) +
					messageLink(
						reaction.message.channelId,
						reaction.message.id
					) +
					"\n" +
					finalTranslation.text,
				embeds: embeds,
			});
		} catch (error) {
			console.log(
				user.username + " (" + user.id + ") does not have public DMs."
			);
		}
	},
};

async function getEmbedTranslation(message, language) {
	const embed = message.embeds[0];
	if (!embed || !embed.description) return false;

	let newEmbed = new EmbedBuilder();

	const translation = await translate(embed.description, { to: language });
	newEmbed.setDescription(translation.text);
	return newEmbed;
}
