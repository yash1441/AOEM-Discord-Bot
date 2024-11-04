const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const date = require("date-and-time");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "kr-alliance-register",
	},
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId("kr-alliance-register-modal")
			.setTitle("KR Alliance Registration");

		const server = new TextInputBuilder()
			.setCustomId("server")
			.setLabel("Server")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const allianceName = new TextInputBuilder()
			.setCustomId("allianceName")
			.setLabel("Alliance Name")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const comment = new TextInputBuilder()
			.setCustomId("comment")
			.setLabel("Comment")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

		const firstActionRow = new ActionRowBuilder().addComponents(server);
		const secondActionRow = new ActionRowBuilder().addComponents(
			allianceName
		);
		const thirdActionRow = new ActionRowBuilder().addComponents(comment);

		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

		await interaction.showModal(modal);

		interaction
			.awaitModalSubmit({ time: 300_000 })
			.then((modalInteraction) => {
				const server =
					modalInteraction.fields.getTextInputValue("server");
				const allianceName =
					modalInteraction.fields.getTextInputValue("allianceName");
				const comment =
					modalInteraction.fields.getTextInputValue("comment");

				modalInteraction.reply({
					content: `Server: ${server}\nAlliance Name: ${allianceName}\nComment: ${comment}`,
					ephemeral: true,
				});

				const now = new Date();

				Sheets.appendRow(
					process.env.ALLIANCE_SHEET,
					"Suggestion!A2:Z",
					[
						[
							interaction.user.id,
							interaction.user.username,
							server,
							allianceName,
							comment,
							date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
						],
					]
				);
			})
			.catch(console.error);
	},
};
