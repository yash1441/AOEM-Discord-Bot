const { EmbedBuilder, MessageFlags } = require("discord.js");
const Sheets = require("../../utils/sheets");
require("dotenv").config();

module.exports = {
    cooldown: 10,
    data: {
        name: "check-pioneer",
    },
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const record = await Sheets.findRow(
            process.env.PIONEER_REGISTRATION_SHEET,
            "Registration!A2:Z",
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("Pioneer Registration")
            .setColor("White")
            .setFooter({
                text: "Age of Empires Mobile",
                iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
            })
            .addFields(
                {
                    name: "Discord ID",
                    value: record.values[0],
                },
                {
                    name: "Discord Username",
                    value: record.values[1],
                },
                {
                    name: "Governor ID",
                    value: record.values[2],
                }
            );

        await interaction.editReply({
            embeds: [embed],
        });
    },
};
