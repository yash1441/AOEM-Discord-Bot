const {
	SlashCommandBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	PermissionFlagsBits,
} = require("discord.js");

module.exports = {
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("button")
		.setDescription("Create a button with specified properties")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) =>
			option
				.setName("id")
				.setDescription("The ID of the button")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("label")
				.setDescription("The Label of the button")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("style")
				.setDescription("The Style of the button")
				.setRequired(false)
				.addChoices(
					{ name: "Primary", value: "Primary" },
					{ name: "Secondary", value: "Secondary" },
					{ name: "Success", value: "Success" },
					{ name: "Danger", value: "Danger" },
					{ name: "Link", value: "Link" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("url")
				.setDescription("The URL of the button")
				.setRequired(false)
		)
		.addBooleanOption((option) =>
			option
				.setName("disabled")
				.setDescription("Whether the button is disabled")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("emoji")
				.setDescription("The Emoji of the button")
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName("message-id")
				.setDescription("The id of the message to attach a button to")
				.setRequired(false)
		),
	async execute(interaction) {
		await interaction.deferReply();

		const label = interaction.options.getString("label") ?? "Test";
		const id = interaction.options.getString("id") ?? "Test";
		const style = interaction.options.getString("style") ?? "Primary";
		const url =
			interaction.options.getString("url") ?? "https://y-gaming.in/";
		const disabled = interaction.options.getBoolean("disabled") ?? false;
		const emoji = interaction.options.getString("emoji") ?? null;
		const messageId = interaction.options.getString("message-id") ?? null;

		const button = new ButtonBuilder().setLabel(label);

		switch (style) {
			case "Primary":
				button.setCustomId(id);
				button.setStyle(ButtonStyle.Primary);
				break;
			case "Secondary":
				button.setCustomId(id);
				button.setStyle(ButtonStyle.Secondary);
				break;
			case "Success":
				button.setCustomId(id);
				button.setStyle(ButtonStyle.Success);
				break;
			case "Danger":
				button.setCustomId(id);
				button.setStyle(ButtonStyle.Danger);
				break;
			case "Link":
				button.setURL(url);
				button.setStyle(ButtonStyle.Link);
				break;
			default:
				button.setCustomId(id);
				button.setStyle(ButtonStyle.Primary);
				break;
		}

		if (disabled) button.setDisabled(true);
		else button.setDisabled(false);

		if (emoji) button.setEmoji(emoji);

		const row = new ActionRowBuilder().addComponents(button);

		await interaction.deleteReply();

		if (messageId) {
			const message = await interaction.channel.messages.fetch(messageId);
			if (message.author.id == process.env.BOT_ID) {
				return await message.edit({ components: [row] });
			}
		}

		await interaction.channel.send({ components: [row] });
	},
};
