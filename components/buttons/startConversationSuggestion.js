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

module.exports = {
	cooldown: 10,
	data: {
		name: "startConversationSuggestion",
	},
	async execute(interaction) {
		const thread = interaction.channel;
		const userData = {
			discordId: interaction.user.id,
			discordUsername: interaction.user.username,
			governorId: "-",
			details: "-",
			platform: "-",
			rating: "-",
			screenshot: null,
		};

		const collectorFilter = (message) =>
			message.author.id === userData.discordId;
		const isFocusGroup = interaction.channel.parentId === "1366682576223207424";

		const sendAndCollectMessage = async (content, timeout) => {
			await thread.send({ content });
			const collected = await thread.awaitMessages({
				filter: collectorFilter,
				time: timeout,
				max: 1,
				errors: ["time"],
			});
			return collected.first();
		};

		const deleteThread = async (notice) => {
			await thread.send({ content: bold(notice) }).catch(() => {});
			setTimeout(() => thread.delete().catch(() => {}), 2_000);
		};

		const askForGovernorId = async () => {
			const prompt =
				blockQuote(bold("Firstly, please provide your Governor ID.\n")) +
				italic("(Only text message can be recorded)");
			const message = await sendAndCollectMessage(prompt, 3_00_000);
			userData.governorId = message.content || "-";
			await thread.send({ content: "Received. Next question." });
		};

		const askForDetails = async () => {
			const prompt = blockQuote(
				bold(
					"Please give a detailed description of your feedback and suggestion, preferably with a screenshot to help us quickly locate the features or systems in your description.",
				),
			);
			const message = await sendAndCollectMessage(prompt, 9_00_000);
			userData.details = message.content || "-";

			const attachment = message.attachments.first();
			if (attachment?.contentType?.startsWith("image")) {
				userData.screenshot = attachment.proxyURL;
			}

			await thread.send({
				content:
					"Thanks a lot for your suggestions. Now, we need collect some basic information.",
			});
		};

		const askForPlatform = async () => {
			const platformSelect = new StringSelectMenuBuilder()
				.setCustomId("suggestion-platform")
				.setPlaceholder("Select your platform")
				.addOptions(
					{
						label: "PC Edition",
						value: "PC Edition",
						emoji: "🖥️",
					},
					{
						label: "Mobile Version",
						value: "Mobile Version",
						emoji: "📱",
					},
				);

			const platformPrompt = await thread.send({
				content: blockQuote(
					bold(
						"Which platform are you playing on?\nPlease select one of the options below.",
					),
				),
				components: [new ActionRowBuilder().addComponents(platformSelect)],
			});

			const platformInteraction = await platformPrompt.awaitMessageComponent({
				filter: (menuInteraction) =>
					menuInteraction.user.id === userData.discordId,
				componentType: ComponentType.StringSelect,
				time: 3_00_000,
				errors: ["time"],
			});

			userData.platform = platformInteraction.values[0] || "-";
			await platformInteraction.update({
				content: "Platform received. Next question.",
				components: [],
			});
		};

		const askForRating = async () => {
			const prompt =
				blockQuote(
					bold(
						"Could you rate the importance of the suggestions you have provided? Reference: 1 star (not important) -5 stars (very important, greatly helpful for improving game experience)\n",
					),
				) + italic("(Only text message can be recorded)");
			const message = await sendAndCollectMessage(prompt, 3_00_000);
			userData.rating = message.content || "-";
			await thread.send({
				content:
					"Thanks for your patience. Your feedback is important for improving the quality of the game. If your suggestions are deemed reasonable and effective, the official will provide you a reward in the future.",
			});
		};

		await interaction.update({
			components: [
				new ActionRowBuilder().addComponents(
					interaction.message.components[0].components[1],
				),
			],
		});

		try {
			await askForGovernorId();
		} catch {
			return deleteThread(
				"You did not provide your Governor ID in time. This thread will be deleted.",
			);
		}

		try {
			await askForDetails();
		} catch {
			return deleteThread(
				"You did not provide detailed description in time. This thread will be deleted.",
			);
		}

		try {
			await askForPlatform();
		} catch {
			return deleteThread(
				"You did not choose your platform in time. This thread will be deleted.",
			);
		}

		try {
			await askForRating();
		} catch {
			return deleteThread(
				"You did not provide rating in time. This thread will be deleted.",
			);
		}

		const embed = new EmbedBuilder()
			.setTitle("Suggestion")
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setDescription(bold("Details") + "\n" + userData.details)
			.addFields(
				{ name: "Governor ID", value: inlineCode(userData.governorId) },
				{ name: "Platform", value: userData.platform },
				{ name: "Rating", value: userData.rating },
			)
			.setColor("Green")
			.setTimestamp();

		if (userData.screenshot) {
			userData.screenshotUrl = await ImgBB(userData.screenshot);
			userData.screenshotFunction = `=HYPERLINK("${userData.screenshotUrl}", IMAGE("${userData.screenshotUrl}", 1))`;
			embed.setImage(userData.screenshotUrl);
		} else {
			userData.screenshotFunction = "-";
		}

		const channelId = isFocusGroup
			? process.env.FOCUS_SUGGESTION_CHANNEL
			: process.env.SUGGESTION_CHANNEL;
		const sheetRange = isFocusGroup
			? "Focus Group Suggestions!A2:Z"
			: "Suggestion!A2:Z";
		const channel = interaction.client.channels.cache.get(channelId);
		if (!channel) throw new Error("Channel not found");

		const message = await channel.send({ embeds: [embed] });
		await Promise.all([message.react("✅"), message.react("❌")]);

		await Sheets.appendRow(process.env.FEEDBACK_SHEET, sheetRange, [
			[
				interaction.user.id,
				interaction.user.username,
				userData.governorId,
				userData.platform,
				userData.details,
				userData.rating,
				date.format(new Date(), "MM-DD-YYYY HH:mm [GMT]ZZ"),
				userData.screenshotFunction,
			],
		]);

		await thread.send({
			content: bold("This thread will be deleted in 10 seconds."),
		});
		setTimeout(() => thread.delete().catch(() => {}), 10_000);
	},
};
