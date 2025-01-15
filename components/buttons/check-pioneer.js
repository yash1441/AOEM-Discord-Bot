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

        if (record.values[5] === "FALSE") {
            embed.setDescription(
                "Sorry! You were not selected. Please try again next time."
            );
            return await interaction.editReply({
                embeds: [embed],
            });
        }

        if (record.values.length > 7) {
            embed.setDescription(
                "Congratulations! You are selected for pioneer server. Your CD Key is " +
                    inlineCode(record.values[7]) +
                    "."
            );
            return await interaction.editReply({
                embeds: [embed],
            });
        }

        const codes = await Sheets.getSpreadsheet(
            process.env.PIONEER_REGISTRATION_SHEET,
            "CDK!A2:Z"
        );

        const unusedCodes = codes.filter((row) => !row[1]).map((row) => row[0]);
        if (unusedCodes.length === 0)
            return await interaction.editReply("No CD Keys available.");

        const codeIndex = codes.findIndex((row) => row[0] === unusedCodes[0]);
        const codeRange = `CDK!A${codeIndex + 2}:C${codeIndex + 2}`;

        await Sheets.updateRow(
            process.env.PIONEER_REGISTRATION_SHEET,
            codeRange,
            [[unusedCodes[0], interaction.user.id, interaction.user.username]]
        );

        console.log(record.range.split(":")[0].slice(1));

        await Sheets.updateRow(
            process.env.PIONEER_REGISTRATION_SHEET,
            "Registration!H" +
                record.range.slice(-1) +
                ":H" +
                record.range.slice(-1),
            [[unusedCodes[0]]]
        );

        embed.setDescription(
            "Congratulations! You are selected for pioneer server. Your CD Key is " +
                inlineCode(unusedCodes[0]) +
                "."
        );

        await interaction.editReply({
            embeds: [embed],
        });
    },
};
