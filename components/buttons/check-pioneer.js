const { EmbedBuilder, MessageFlags, inlineCode, bold } = require("discord.js");
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
					value: record.values[7],
					inline: true,
				}
			);

		if (record.values[6] === "FALSE") {
			embed.setDescription(
				"Sorry! You were not selected. Please try again next time."
			);
			return await interaction.editReply({
				embeds: [embed],
			});
		}

		if (record.values.length > 8) {
			embed.setDescription(
				"Congratulations, you have been successfully selected to participate in this Pioneer Server test. Here is your CDK: " +
					inlineCode(record.values[8]) +
					". Wish you a pleasant gaming experience!\n" +
					bold("Note:") +
					"\n1. If you chose the IOS system when registering, please pay attention to the email you submitted during registration. We will send you a Test Flight test invitation to your email within one day. You need to download the game from Test Flight and join the test.\n2. If you chose the Android system when registering, please click on the link below to download the Apk package and participate in the test. We recommend that you use an emulator to play to avoid affecting the progress of your account on the official server. Link: https://download.aoemobile.com/apk/AOEM_And_D_v1.6.2.114_AOEM_T4_Pioneer.apk\n3. In order to optimize the testing experience for the Governors, this test adopts the method of prefabricated characters. Due to the large amount of prefabricated character data, Governors are required to download over 3 Gb game resources when entering the game for the first time. Please wait patiently before the data loading is done."
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

		await Sheets.updateRow(process.env.PIONEER_REGISTRATION_SHEET, codeRange, [
			[unusedCodes[0], interaction.user.id, interaction.user.username],
		]);

		await Sheets.updateRow(
			process.env.PIONEER_REGISTRATION_SHEET,
			"Registration!I" + record.range.slice(-1) + ":I" + record.range.slice(-1),
			[[unusedCodes[0]]]
		);

		embed.setDescription(
			"Congratulations, you have been successfully selected to participate in this Pioneer Server test. Here is your CDK: " +
				inlineCode(unusedCodes[0]) +
				". Wish you a pleasant gaming experience!\n" +
				bold("Note:") +
				"\n1. If you chose the IOS system when registering, please pay attention to the email you submitted during registration. We will send you a Test Flight test invitation to your email within one day. You need to download the game from Test Flight and join the test.\n2. If you chose the Android system when registering, please click on the link below to download the Apk package and participate in the test. We recommend that you use an emulator to play to avoid affecting the progress of your account on the official server. Link: https://download.aoemobile.com/apk/AOEM_And_D_v1.7.300.100_AOEM_T5_Pioneer.apk\n3. In order to optimize the testing experience for the Governors, this test adopts the method of prefabricated characters. Due to the large amount of prefabricated character data, Governors are required to download over 3 Gb game resources when entering the game for the first time. Please wait patiently before the data loading is done."
		);

		await interaction.editReply({
			embeds: [embed],
		});
	},
};
