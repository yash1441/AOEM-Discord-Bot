const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	PermissionFlagsBits,
	bold,
} = require("discord.js");
const Sheets = require("../../utils/sheets");

module.exports = {
	cooldown: 60,
	category: "server",
	data: new SlashCommandBuilder()
		.setName("alliance")
		.setDescription("Alliance related commands")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("setup")
				.setDescription("Setup alliance embed and buttons")
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle("Alliance")
			.setColor("White")
			.setDescription(bold("Rules & Notice"))
			.setFooter({
				text: "Age of Empires Mobile",
				iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
			});

		const jpAllianceButton = new ButtonBuilder()
			.setLabel("JP Register")
			.setStyle(ButtonStyle.Success)
			.setCustomId("jp-alliance-register")
			.setEmoji("📜");

		const krAllianceButton = new ButtonBuilder()
			.setLabel("KR Register")
			.setStyle(ButtonStyle.Success)
			.setCustomId("kr-alliance-register")
			.setEmoji("📜");

		const checkButton = new ButtonBuilder()
			.setLabel("Check")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("check-alliance")
			.setEmoji("🔍");

		const row = new ActionRowBuilder().addComponents(
			jpAllianceButton,
			krAllianceButton,
			checkButton
		);

		await interaction.channel.send({ embeds: [embed], components: [row] });

		await interaction.editReply({ content: "Alliance setup complete!" });
	},
};
