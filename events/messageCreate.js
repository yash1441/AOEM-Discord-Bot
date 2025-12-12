const { Events } = require("discord.js");
const date = require("date-and-time");
const Sheets = require("../utils/sheets");
require("dotenv").config();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		return;
		if (message.channelId != "1024167955677839431") return;
		if (
			message.content.toLowerCase() !=
			"Celebrate the Miracle Age together! Exciting welfare events will begin tomorrow!".toLowerCase()
		)
			return;

		const record = await Sheets.findRow(
			process.env.FEEDBACK_SHEET,
			"Giveaway!A2:Z",
			message.author.id
		);

		if (record != null) return;

		const now = new Date();

		await Sheets.appendRow(process.env.FEEDBACK_SHEET, "Giveaway!A2:Z", [
			[
				message.author.id,
				message.author.username,
				date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
			],
		]);

		await message.reply({
			content: "You have been entered into the giveaway!",
		});
	},
};
