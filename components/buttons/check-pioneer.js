const { EmbedBuilder, MessageFlags, inlineCode } = require("discord.js");
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

        if (record === null)
            return await interaction.editReply("You are not registered.");

        const codes = await Sheets.getSpreadsheet(
            process.env.PIONEER_REGISTRATION_SHEET,
            "CDK!A2:Z"
        );

        const unusedCodes = codes.filter((row) => !row[1]).map((row) => row[0]);

        console.log(unusedCodes);

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
                    inline: true,
                },
                {
                    name: "Discord Username",
                    value: record.values[1],
                    inline: true,
                },
                {
                    name: "Governor ID",
                    value: record.values[2],
                    inline: true,
                },
                {
                    name: "Platform",
                    value: record.values[6],
                    inline: true,
                }
            );

        if (record.values[5] === "FALSE")
            embed.setDescription(
                "Sorry! You were not selected. Please try again next time."
            );
        else
            embed.setDescription(
                "Congratulations! You are selected for pioneer server. Your CD Key is " +
                    inlineCode("1234567890") +
                    "."
            );

        await interaction.editReply({
            embeds: [embed],
        });
    },
};
