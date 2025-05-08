const {
	EmbedBuilder,
	ActionRowBuilder,
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
		name: "startConversationSuggestion",
	},
	async execute(interaction) {
		const endConversation = new ActionRowBuilder().addComponents(
			interaction.message.components[0].components[1]
		);
		const thread = interaction.channel;
		await interaction.update({ components: [endConversation] });

		let timedOut = false;
		const userData = {
			discordId: interaction.user.id,
			discordUsername: interaction.user.username,
		};

		const collectorFilter = (m) => interaction.user.id === m.author.id;

		await thread.send({
			content:
				blockQuote(bold("Firstly, please provide your Governor ID.\n")) +
				italic("(Only text message can be recorded)"),
		});

		await thread
			.awaitMessages({
				filter: collectorFilter,
				time: 3_00_000,
				max: 1,
				errors: ["time"],
			})
			.then((messages) => {
				userData.governorId = messages.first().content;
				thread.send({ content: "Received. Next question." });
			})
			.catch(() => {
				timedOut = true;
			});

		if (timedOut) {
			await thread
				.send({
					content: bold(
						"You did not provide your Governor ID in time. This thread will be deleted."
					),
				})
				.catch();
			setTimeout(function () {
				thread.delete().catch();
			}, 2_000);
			return;
		}

		await thread.send({
			content: blockQuote(
				bold(
					"Please give a detailed description of your feedback and suggestion, preferably with a screenshot to help us quickly locate the features or systems in your description."
				)
			),
		});

		await thread
			.awaitMessages({
				filter: collectorFilter,
				time: 9_00_000,
				max: 1,
				errors: ["time"],
			})
			.then((messages) => {
				userData.details = messages.first().content
					? messages.first().content
					: "-";

				const attachment = messages.first().attachments.first();
				if (attachment && attachment.contentType.includes("image"))
					userData.screenshot = attachment.proxyURL;

				thread.send({
					content:
						"Thanks a lot for your suggestions. Now, we need collect some basic information.",
				});
			})
			.catch(() => {
				timedOut = true;
			});

		if (timedOut) {
			await thread
				.send({
					content: bold(
						"You did not provide detailed description in time. This thread will be deleted."
					),
				})
				.catch();
			setTimeout(function () {
				thread.delete().catch();
			}, 2_000);
			return;
		}

		await thread.send({
			content:
				blockQuote(
					bold(
						"Could you rate the importance of the suggestions you have provided? Reference: 1 star (not important) -5 stars (very important, greatly helpful for improving game experience)\n"
					)
				) + italic("(Only text message can be recorded)"),
		});

		await thread
			.awaitMessages({
				filter: collectorFilter,
				time: 3_00_000,
				max: 1,
				errors: ["time"],
			})
			.then((messages) => {
				userData.rating = messages.first().content;
				thread.send({
					content:
						"Thanks for your patience. Your feedback is important for improving the quality of the game. If your suggestions are deemed reasonable and effective, the official will provide you a reward in the future.",
				});
			})
			.catch(() => {
				timedOut = true;
			});

		if (timedOut) {
			await thread
				.send({
					content: bold(
						"You did not provide rating in time. This thread will be deleted."
					),
				})
				.catch();
			setTimeout(function () {
				thread.delete().catch();
			}, 2_000);
			return;
		}

		if (!userData.governorId) userData.governorId = "-";
		if (!userData.details) userData.details = "-";
		if (!userData.timeOfOccurence) userData.rating = "-";

		const embed = new EmbedBuilder()
			.setTitle("Suggestion")
			.setAuthor({
				name: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
			.setDescription(bold("Details") + "\n" + userData.details)
			.addFields(
				{ name: "Governor ID", value: inlineCode(userData.governorId) },
				{ name: "Rating", value: userData.rating }
			)
			.setColor("Green")
			.setTimestamp();

		if (userData.screenshot) {
			userData.screenshotUrl = await ImgBB(userData.screenshot);
			userData.screenshotFunction =
				'=HYPERLINK("' +
				userData.screenshotUrl +
				'", IMAGE("' +
				userData.screenshotUrl +
				'", 1))';
			embed.setImage(userData.screenshotUrl);
		} else {
			userData.screenshotFunction = "-";
		}
		if (interaction.channel.parentId != "1366682576223207424") {
			const channel = interaction.client.channels.cache.get(
				process.env.SUGGESTION_CHANNEL
			);
			const message = await channel.send({ embeds: [embed] });
			await message.react("✅").then(message.react("❌"));
		}

		const now = new Date();

		await Sheets.appendRow(
			process.env.FEEDBACK_SHEET,
			interaction.channel.parentId === "1366682576223207424"
				? "Focus Group Suggestions!A2:Z"
				: "Suggestion!A2:Z",
			[
				[
					interaction.user.id,
					interaction.user.username,
					userData.governorId,
					userData.details,
					userData.rating,
					date.format(now, "MM-DD-YYYY HH:mm [GMT]ZZ"),
					userData.screenshotFunction,
				],
			]
		);

		await thread.send({
			content: bold("This thread will be deleted in 10 seconds."),
		});

		setTimeout(function () {
			thread.delete().catch();
		}, 10_000);
	},
};
