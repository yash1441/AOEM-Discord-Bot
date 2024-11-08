const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require("discord.js");
const Sequelize = require('sequelize');
require("dotenv").config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/alliance.sqlite',
    logging: console.log,
});

const Alliance = sequelize.define('jp_alliance', {
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    user_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    server: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    alliance_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
	comment: {
		type: Sequelize.TEXT,
		allowNull: true,
	},
});

module.exports = {
	cooldown: 10,
	data: {
		name: "jp-alliance-register",
	},
	async execute(interaction) {
		Alliance.sync(); // DELETE AFTER ONE GO

		const modal = new ModalBuilder()
			.setCustomId("jp-alliance-register-modal")
			.setTitle("JP Alliance Registration");

		const server = new TextInputBuilder()
			.setCustomId("server")
			.setLabel("サーバー")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const allianceName = new TextInputBuilder()
			.setCustomId("allianceName")
			.setLabel("同盟名")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const comment = new TextInputBuilder()
			.setCustomId("comment")
			.setLabel("コメント")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

		const firstActionRow = new ActionRowBuilder().addComponents(server);
		const secondActionRow = new ActionRowBuilder().addComponents(
			allianceName
		);
		const thirdActionRow = new ActionRowBuilder().addComponents(comment);

		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

		await interaction.showModal(modal);

		interaction
			.awaitModalSubmit({ time: 300_000 })
			.then((modalInteraction) => {
				const server =
					modalInteraction.fields.getTextInputValue("server");
				const allianceName =
					modalInteraction.fields.getTextInputValue("allianceName");
				const comment =
					modalInteraction.fields.getTextInputValue("comment");

				modalInteraction.reply({
					content: `Server: ${server}\nAlliance Name: ${allianceName}\nComment: ${comment}`,
					ephemeral: true,
				});

				Alliance.create({
					user_id: interaction.user.id,
					user_name: interaction.user.username,
					server: server,
					alliance_name: allianceName,
					comment: comment,
				});
			})
			.catch(console.error);
	},
};
