const {
	ActionRowBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	MessageFlags,
} = require("discord.js");
const date = require("date-and-time");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "platform-pioneer",
	},
	async execute(interaction) {
		const platform = interaction.values[0];

		const modal = new ModalBuilder()
			.setCustomId("register-pioneer-modal")
			.setTitle("Pioneer Server Registration");

		const governorIdInput = new TextInputBuilder()
			.setCustomId("governor-id")
			.setLabel("Governor ID")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const emailInput = new TextInputBuilder()
			.setCustomId("email")
			.setLabel("Email")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const firstRow = new ActionRowBuilder().addComponents(governorIdInput);
		const secondRow = new ActionRowBuilder().addComponents(emailInput);

		if (platform === "iOS") {
			modal.addComponents(firstRow, secondRow);
		} else modal.addComponents(firstRow);

		await interaction.showModal(modal);

		await interaction
			.awaitModalSubmit({ time: 60_000 })
			.then((modalInteraction) => {
				const governorId =
					modalInteraction.fields.getTextInputValue("governor-id");
				let email = "";

				if (platform === "iOS")
					email = modalInteraction.fields.getTextInputValue("email");

				findOrCreateRegistration(
					modalInteraction,
					governorId,
					email,
					platform,
					interaction
				);
			})
			.catch((e) => {
				interaction.editReply({
					content:
						"You did not submit the modal in time. Please try again.",
					components: [],
				});
			});
	},
};

async function findOrCreateRegistration(
	interaction,
	governorId,
	email,
	platform,
	mainInteraction
) {
	try {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
	} catch (e) {
		console.log(interaction);
		return mainInteraction.editReply({
			content: "There was an error. Please try again.",
			components: [],
		});
	}

	const roles = interaction.member.roles.cache
		.filter((role) => role.name !== "@everyone")
		.map((role) => role.name)
		.join(", ");

	const now = new Date();

	const [found, created] = await Sheets.findOrAppend(
		process.env.PIONEER_REGISTRATION_SHEET,
		"Registration!A2:Z",
		interaction.user.id,
		[
			[
				interaction.user.id,
				interaction.user.username,
				governorId,
				roles,
				date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
				email,
				"FALSE",
				platform,
			],
		]
	);

	if (found) {
		return await interaction.editReply({
			content: "You have already registered!",
		});
	}

	await interaction.editReply({
		content: "Registered successfully!",
	});
}
