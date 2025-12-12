const { MessageFlags, codeBlock, channelMention } = require("discord.js");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "joinGiveaway",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const record = await Sheets.findRow(
			process.env.FEEDBACK_SHEET,
			"Giveaway!A2:Z",
			interaction.user.id
		);

		if (record != null)
			return await interaction.editReply({
				content: "You have already entered the giveaway.",
			});
		else
			return await interaction.editReply({
				content:
					"Please use the phrase below in " +
					channelMention("1303057362780815472") +
					" to join the giveaway:\n" +
					codeBlock(
						"Celebrate the Miracle Age together! Exciting welfare events will begin tomorrow!"
					),
			});
	},
};
