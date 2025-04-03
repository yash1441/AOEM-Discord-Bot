const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	PermissionFlagsBits,
	MessageFlags,
} = require("discord.js");

module.exports = {
	cooldown: 60,
	category: "server",
	data: new SlashCommandBuilder()
		.setName("register")
		.setDescription("Registration related commands")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("setup")
				.setDescription("Setup register embed and buttons")
		),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = new EmbedBuilder()
			.setTitle("Pioneer Server Recruitment is now open!")
			.setColor("White")
			.addFields(
				{
					name: "Registration Period: 4.3 - 4.7, 23:59 (UTC)",
					value:
						"Click the sign-up button to fill in the necessary information and complete your registration. Please note that each Discord account can only register once, so please fill in your details carefully.",
					inline: false,
				},
				{
					name: "Qualification Distribution: 4.7 - 4.9",
					value:
						'During the qualification distribution period, click on the "Check" button to view your registration results. If you are selected, the Bot will send you a CDK to join the Pioneer Server.',
					inline: false,
				},
				{
					name: "Pioneer Server Testing Period: 4.9 - 4.16",
					value: "\u200b",
					inline: false,
				}
			)
			.setImage("https://i.ibb.co/WvR3cf4p/image.png")
			.setFooter({
				text: "Age of Empires Mobile",
				iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
			});

		const registerButton = new ButtonBuilder()
			.setLabel("Sign Up")
			.setStyle(ButtonStyle.Primary)
			.setCustomId("register-pioneer")
			.setEmoji("📃");

		// const checkButton = new ButtonBuilder()
		// 	.setLabel("Check")
		// 	.setStyle(ButtonStyle.Success)
		// 	.setCustomId("check-pioneer")
		// 	.setEmoji("🔍");

		const row = new ActionRowBuilder().addComponents(
			registerButton
			//checkButton
		);

		await interaction.channel.send({ embeds: [embed], components: [row] });

		await interaction.editReply({
			content: "Registration setup complete!",
		});
	},
};
