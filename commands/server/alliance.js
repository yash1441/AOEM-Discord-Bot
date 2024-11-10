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

		const jpCheckButton = new ButtonBuilder()
			.setLabel("JP Check")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("jp-check-alliance")
			.setEmoji("🔍");

		const krCheckButton = new ButtonBuilder()
			.setLabel("KR Check")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("kr-check-alliance")
			.setEmoji("🔍");

		const firstRow = new ActionRowBuilder().addComponents(
			jpAllianceButton,
			krAllianceButton
		);

		const secondRow = new ActionRowBuilder().addComponents(
			jpCheckButton,
			krCheckButton
		);

		await interaction.channel.send({
			embeds: [embed],
			components: [firstRow, secondRow],
		});

		await interaction.editReply({ content: "Alliance setup complete!" });
	},
};
