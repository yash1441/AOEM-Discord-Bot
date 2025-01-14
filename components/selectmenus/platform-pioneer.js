const {
    ComponentType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    MessageFlags,
    inlineCode,
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
        const platform = collected.values[0];

        await interaction.update({
            content: "You selected: " + inlineCode(platform),
            components: [],
        });

        const modal = new ModalBuilder()
            .setCustomId("register-pioneer-modal")
            .setTitle("Pioneer Server Registration");

        const governorIdInput = new TextInputBuilder()
            .setCustomId("governor-id")
            .setLabel("Governor ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const modalRow = new ActionRowBuilder().addComponents(governorIdInput);

        modal.addComponents(modalRow);

        await interaction.showModal(modal);

        await interaction
            .awaitModalSubmit({ time: 60_000 })
            .then((modalInteraction) => {
                const governorId =
                    modalInteraction.fields.getTextInputValue("governor-id");

                findOrCreateRegistration(
                    modalInteraction,
                    governorId,
                    platform
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

async function findOrCreateRegistration(interaction, governorId, platform) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

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
