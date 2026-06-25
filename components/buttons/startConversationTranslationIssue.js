const {
	EmbedBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ComponentType,
	inlineCode,
	bold,
	italic,
	blockQuote,
} = require("discord.js");
const date = require("date-and-time");
const Sheets = require("../../utils/sheets");
const ImgBB = require("../../utils/imgbb");

require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "startConversationTranslationIssue",
	},
	async execute(interaction) {
		const thread = interaction.channel;
		await interaction.update({
			components: [
				new ActionRowBuilder().addComponents(
					interaction.message.components[0].components[1],
				),
			],
		});

		const userData = {
			discordId: interaction.user.id,
			discordUsername: interaction.user.username,
			governorId: "-",
			details: "-",
			platform: "-",
			deviceInfo: "-",
			timeOfOccurence: "-",
			screenshot: null,
			screenshotFunction: "-",
		};

		const collectorFilter = (message) =>
			message.author.id === userData.discordId;

		const deleteThread = async (notice) => {
			await thread.send({ content: bold(notice) }).catch(() => {});
			setTimeout(() => thread.delete().catch(() => {}), 2_000);
		};

		const collectMessage = async (content, timeout) => {
			await thread.send({ content });
			const collected = await thread.awaitMessages({
				filter: collectorFilter,
				time: timeout,
				max: 1,
				errors: ["time"],
			});
			return collected.first();
		};

		const collectSelect = async (content, menu) => {
			const prompt = await thread.send({
				content,
				components: [new ActionRowBuilder().addComponents(menu)],
			});
			const selection = await prompt.awaitMessageComponent({
				filter: (menuInteraction) =>
					menuInteraction.user.id === userData.discordId,
				componentType: ComponentType.StringSelect,
				time: 3_00_000,
				errors: ["time"],
			});
			await selection.update({
				content: "Platform received. Next question.",
				components: [],
			});
			return selection.values[0] || "-";
		};

		try {
			const governorMessage = await collectMessage(
				blockQuote(bold("Firstly, please provide your Governor ID.\n")) +
					italic("(Only text message can be recorded)"),
				3_00_000,
			);
			userData.governorId = governorMessage.content || "-";
			await thread.send({ content: "Received. Next question." });
		} catch {
			return deleteThread(
				"You did not provide your Governor ID in time. This thread will be deleted.",
			);
		}

		try {
			const detailMessage = await collectMessage(
				blockQuote(
					bold(
						"Please give a detailed description of the problem you have encountered, preferably with a screenshot to help us quickly determine the root cause of the problem.",
					),
				),
				6_00_000,
			);
			userData.details = detailMessage.content || "-";

			const attachment = detailMessage.attachments.first();
			if (attachment?.contentType?.startsWith("image")) {
				userData.screenshot = attachment.proxyURL;
			}

			await thread.send({
				content:
					"Thanks a lot for your feedback. Now, we need collect some basic information.",
			});
		} catch {
			return deleteThread(
				"You did not provide detailed description in time. This thread will be deleted.",
			);
		}

		try {
			const platformMenu = new StringSelectMenuBuilder()
				.setCustomId("translation-platform")
				.setPlaceholder("Select your platform")
				.addOptions(
					{ label: "PC Edition", value: "PC Edition", emoji: "🖥️" },
					{ label: "Mobile Version", value: "Mobile Version", emoji: "📱" },
				);

			userData.platform = await collectSelect(
				blockQuote(bold("Which platform are you playing on?")),
				platformMenu,
			);
		} catch {
			return deleteThread(
				"You did not choose your platform in time. This thread will be deleted.",
			);
		}

		try {
			const deviceMessage = await collectMessage(
				blockQuote(
					bold(
						"Please provide your device model, operating system, and game version in a single message.\n",
					),
				) + italic("(Only text message can be recorded)"),
				3_00_000,
			);
			userData.deviceInfo = deviceMessage.content || "-";
			await thread.send({ content: "Received. One last question!" });
		} catch {
			return deleteThread(
				"You did not provide device info in time. This thread will be deleted.",
			);
		}

		try {
			const timeMessage = await collectMessage(
				blockQuote(
					bold(
						"What time did this issue occur (server time, UTC+0)? Is it mandatory or occasional?\n",
					),
				) + italic("(Only text message can be recorded)"),
				3_00_000,
			);
			userData.timeOfOccurence = timeMessage.content || "-";
			await thread.send({
				content:
					"Thanks for your patience. Your feedback is important for the smooth operation of the game. If the problem you reported is verified to be genuine, the official will provide you a reward in the future.",
			});
		} catch {
			return deleteThread(
				"You did not provide time of occurence in time. This thread will be deleted.",
			);
		}

		const embed = new EmbedBuilder()
			.setTitle("Translation Issue")
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setDescription(bold("Details") + "\n" + userData.details)
			.addFields(
				{ name: "Governor ID", value: inlineCode(userData.governorId) },
				{ name: "Platform", value: userData.platform },
				{ name: "Device Info", value: userData.deviceInfo },
				{ name: "Time of Occurence", value: userData.timeOfOccurence },
			)
			.setColor("Blue")
			.setTimestamp();

		if (userData.screenshot) {
			userData.screenshotUrl = await ImgBB(userData.screenshot);
			userData.screenshotFunction = `=HYPERLINK("${userData.screenshotUrl}", IMAGE("${userData.screenshotUrl}", 1))`;
			embed.setImage(userData.screenshotUrl);
		}

		const channel = interaction.client.channels.cache.get(
			process.env.TRANSLATION_CHANNEL,
		);
		if (!channel) throw new Error("Channel not found");
		await channel.send({ embeds: [embed] });

		const now = new Date();
		await Sheets.appendRow(process.env.FEEDBACK_SHEET, "Translation!A2:Z", [
			[
				interaction.user.id,
				interaction.user.username,
				userData.governorId,
				userData.platform,
				userData.details,
				userData.deviceInfo,
				userData.timeOfOccurence,
				date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
				userData.screenshotFunction,
			],
		]);

		await thread.send({
			content: bold("This thread will be deleted in 10 seconds."),
		});
		setTimeout(() => thread.delete().catch(() => {}), 10_000);
	},
};
