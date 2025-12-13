const { MessageFlags, codeBlock, channelMention } = require("discord.js");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "joinGiveaway",
	},
	async execute(interaction) {
		const record = await Sheets.findRow(
			process.env.FEEDBACK_SHEET,
			"Giveaway!A2:Z",
			interaction.user.id
		);

		if (record != null)
			return await interaction.reply({
				content: "You have already entered the giveaway.",
				flags: MessageFlags.Ephemeral,
			});
		else
			return await interaction.reply({
				content:
					"Please use the phrase below in " +
					channelMention("1024167955677839431") +
					" to join the giveaway:\n" +
					codeBlock(
						"Celebrate the Miracle Age together! Exciting welfare events are on the way!"
					),
				flags: MessageFlags.Ephemeral,
			});
	},
};
