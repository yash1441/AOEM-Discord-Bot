const { Events } = require("discord.js");
const date = require("date-and-time");
const Sheets = require("../utils/sheets");
require("dotenv").config();

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.channelId != "1303057362780815472") return;
		if (message.content.toLowerCase() != "aoem is the best game") return;

		const record = await Sheets.findRow(
			process.env.FEEDBACK_SHEET,
			"Giveaway!A2:Z",
			interaction.user.id
		);

		if (record != null) return;

		const now = new Date();

		await Sheets.appendRow(process.env.FEEDBACK_SHEET, "Giveaway!A2:Z", [
			message.author.id,
			message.author.username,
			date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
		]);
	},
};
