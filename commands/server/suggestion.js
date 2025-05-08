const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	PermissionFlagsBits,
	bold,
	MessageFlags,
} = require("discord.js");

module.exports = {
	cooldown: 60,
	category: "server",
	data: new SlashCommandBuilder()
		.setName("suggestion")
		.setDescription("Suggestion related commands")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("setup")
				.setDescription("Setup suggestion embed and buttons")
		),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = new EmbedBuilder()
			.setTitle("Group Suggestion Submission Rules")
			.setColor("White")
			.setDescription(
				"1. Focus on information accuracy: Ensure your submissions contain suggestions that benefit the game's long-term development. Provide detailed descriptions to help the development team easily understand your requests. For bug reports and other feedback, please use the appropriate channels.\n2. Include relevant game information: Be sure to accurately provide your in-game details so official staff can contact you when needed. Excellent suggestions may even net you additional rewards!\n3. Do not submit meaningless content: Prohibited content includes, but is not limited to, meaningless venting of dissatisfaction, malicious attacks on products/Mods/official staff, repeatedly spamming the same issue, etc.\n4. For feedback submissions that violate the rules, Mods and official staff reserve the right to take the following actions according to Group Rules, including but not limited to: removing inappropriate feedback, revoking Focus Group role, etc.\n5. All user feedback is equal: Please note that the development team respects suggestions from all Governors equally. Collecting suggestions separately from the Focus Group is only to better understand core users' needs. This does not mean that suggestions from Focus Group Governors have any priority advantage in processing or implementation. All optimizations released by the development team are based on comprehensive research from every Governor."
			)
			.setFooter({
				text: "Age of Empires Mobile",
				iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
			});

		const suggestionButton = new ButtonBuilder()
			.setLabel("Suggestion")
			.setStyle(ButtonStyle.Success)
			.setCustomId("suggestion")
			.setEmoji("💡");

		const row = new ActionRowBuilder().addComponents(suggestionButton);

		await interaction.channel.send({ embeds: [embed], components: [row] });

		await interaction.editReply({ content: "Suggestion setup complete!" });
	},
};
