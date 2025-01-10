const {
    ModalBuilder,
    ActionRowBuilder,
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
        name: "register-pioneer",
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("regiester-pioneer-modal")
            .setTitle("Pioneer Server Registration");

        const governorIdInput = new TextInputBuilder()
            .setCustomId("governor-id")
            .setLabel("Governor ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(
            governorIdInput
        );

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);

        interaction
            .awaitModalSubmit({ time: 60_000 })
            .then((modalInteraction) => {
                const governorId =
                    modalInteraction.fields.getTextInputValue("governor-id");

                findOrCreateRegistration(governorId, modalInteraction);
            })
            .catch(console.error);
    },
};

async function findOrCreateRegistration(governorId, interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const roles = interaction.member.roles.cache
        .map((role) => role.name)
        .join(", ");

    const now = new Date();

    await Sheets.appendRow(
        process.env.PIONEER_REGISTRATION_SHEET,
        "Registration!A2:Z",
        [
            [
                interaction.user.id,
                interaction.user.username,
                governorId,
                roles,
                date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
            ],
        ]
    );

    await interaction.editReply({
        content: "Registered successfully!",
    });
}
