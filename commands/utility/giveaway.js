const {
	SlashCommandBuilder,
	MessageFlags,
	PermissionFlagsBits,
} = require("discord.js");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("giveaway")
		.setDescription("Giveaway command")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("winner")
				.setDescription("Selects winner(s) from giveaway entries")
				.addIntegerOption((option) =>
					option
						.setName("number")
						.setDescription("The number of winners to select")
						.setRequired(true)
				)
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const subcommand = interaction.options.getSubcommand();
		if (subcommand === "winner") {
			const numberOfWinners = interaction.options.getInteger("number");
			const records = await Sheets.getSpreadsheet(
				process.env.FEEDBACK_SHEET,
				"Giveaway!A2:C"
			);

			if (!records || records.length === 0) {
				return interaction.editReply({
					content: "No entries found for the giveaway.",
				});
			}

			const entries = records.map((row) => ({
				id: row[0],
				username: row[1],
			}));

			const winners = [];
			const usedIndices = new Set();
			while (winners.length < Math.min(numberOfWinners, entries.length)) {
				const randomIndex = Math.floor(Math.random() * entries.length);
				if (!usedIndices.has(randomIndex)) {
					usedIndices.add(randomIndex);
					winners.push(entries[randomIndex]);
				}
			}

			const winnerMentions = winners
				.map((winner) => `<@${winner.id}> (${winner.username})`)
				.join("\n");
			return interaction.editReply({
				content: `🎉 Congratulations to the winner(s):\n${winnerMentions}`,
			});
		}
	},
};
