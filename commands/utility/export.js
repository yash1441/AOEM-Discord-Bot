const {
	SlashCommandBuilder,
	codeBlock,
	MessageFlags,
	PermissionFlagsBits,
} = require("discord.js");

module.exports = {
	cooldown: 5,
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("export")
		.setDescription("Show all environment variables (owner-only, ephemeral).")
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	async execute(interaction) {
		const ownerId = process.env.MY_ID;

		if (!ownerId) {
			return interaction.reply({
				content: "MY_ID is not configured on this bot.",
				flags: MessageFlags.Ephemeral,
			});
		}

		if (interaction.user.id !== ownerId) {
			return interaction.reply({
				content: "You are not authorized to use this command.",
				flags: MessageFlags.Ephemeral,
			});
		}

		// Build a plain text listing of environment variables
		const entries = Object.entries(process.env).map(([k, v]) => `${k}=${v}`);
		const content = entries.join("\n");

		try {
			// If content is small enough, send inline; otherwise send as a file
			if (content.length <= 1900) {
				return interaction.reply({
					content: codeBlock(content),
					flags: MessageFlags.Ephemeral,
				});
			}

			const buffer = Buffer.from(content, "utf8");
			return interaction.reply({
				files: [{ attachment: buffer, name: "env.txt" }],
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			console.error("/export error:", err);
			return interaction.reply({
				content: "Failed to export environment variables.",
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
