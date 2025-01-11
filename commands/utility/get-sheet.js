const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
    cooldown: 5,
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("get-sheet")
        .setDescription("Gets the spreadsheet")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
        });

        const records = await Sheets.getSpreadsheet(
            process.env.PIONEER_REGISTRATION_SHEET,
            "Registration!A2:Z"
        );

        console.log(records);

        await interaction.editReply({
            content: "Done. Check console.",
        });
    },
};
