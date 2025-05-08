const {
	SlashCommandBuilder,
	EmbedBuilder,
	PermissionFlagsBits,
	MessageFlags,
} = require("discord.js");

module.exports = {
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("embed")
		.setDescription("Create an embed with specified properties")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName("title")
				.setDescription("The title of the embed")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("The description of the embed")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("color")
				.setDescription("The color of the embed")
				.setRequired(false)
				.addChoices(
					{ name: "Red", value: "CC0000" },
					{ name: "Green", value: "009900" },
					{ name: "Blue", value: "0000CC" },
					{ name: "Transparent", value: "2B2D31" },
					{ name: "White", value: "FFFFFF" },
					{ name: "Black", value: "000000" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("thumbnail")
				.setDescription("The thumbnail of the embed")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("image")
				.setDescription("The image of the embed")
				.setRequired(false)
		),
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const title = interaction.options.getString("title") ?? "Title";
		const description =
			interaction.options.getString("description") ?? "Description";
		const color = interaction.options.getString("color") ?? "White";
		const thumbnail = interaction.options.getString("thumbnail") ?? null;
		const image = interaction.options.getString("image") ?? null;

		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description.split("\\n").join("\n"))
			.setColor(color);

		image && embed.setImage(image);
		thumbnail && embed.setThumbnail(thumbnail);

		await interaction.channel.send({ embeds: [embed] });
		await interaction.deleteReply();
	},
};
