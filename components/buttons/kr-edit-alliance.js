const {
	ModalBuilder,
	ActionRowBuilder,
	TextInputBuilder,
	TextInputStyle,
	inlineCode,
} = require("discord.js");
const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db/alliance.sqlite",
	logging: true,
});

const Alliance = sequelize.define(
	"kr_alliance",
	{
		user_id: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: false,
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
		createdAt: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			defaultValue: Sequelize.DataTypes.NOW, // This ensures a timestamp is set upon creation
		},
	},
	{ timestamps: false }
);

module.exports = {
	cooldown: 10,
	data: {
		name: "kr-edit-alliance",
	},
	async execute(interaction) {
		Alliance.sync();

		const modal = new ModalBuilder()
			.setCustomId("kr-edit-alliance-modal")
			.setTitle("Edit");

		const idInput = new TextInputBuilder()
			.setCustomId("id")
			.setLabel("Enter the ID")
			.setStyle(TextInputStyle.Short)
			.setRequired(true);

		const server = new TextInputBuilder()
			.setCustomId("server")
			.setLabel("Server")
			.setStyle(TextInputStyle.Short)
			.setRequired(false);

		const allianceName = new TextInputBuilder()
			.setCustomId("allianceName")
			.setLabel("Alliance Name")
			.setStyle(TextInputStyle.Short)
			.setRequired(false);

		const comment = new TextInputBuilder()
			.setCustomId("comment")
			.setLabel("Comment")
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(false);

		const firstActionRow = new ActionRowBuilder().addComponents(idInput);
		const secondActionRow = new ActionRowBuilder().addComponents(server);
		const thirdActionRow = new ActionRowBuilder().addComponents(
			allianceName
		);
		const fourthActionRow = new ActionRowBuilder().addComponents(comment);

		modal.addComponents(
			firstActionRow,
			secondActionRow,
			thirdActionRow,
			fourthActionRow
		);

		await interaction.showModal(modal);

		interaction
			.awaitModalSubmit({ time: 300_000 })
			.then((modalInteraction) => {
				const id = modalInteraction.fields.getTextInputValue("id");
				const server =
					modalInteraction.fields.getTextInputValue("server");
				const allianceName =
					modalInteraction.fields.getTextInputValue("allianceName");
				const comment =
					modalInteraction.fields.getTextInputValue("comment");

				const data = {
					id: id,
				};

				server ? (data.server = server) : null;
				allianceName ? (data.alliance_name = allianceName) : null;
				comment ? (data.comment = comment) : null;

				findAndEditAlliance(data, modalInteraction);
			})
			.catch(console.error);
	},
};

async function findAndEditAlliance(data, modalInteraction) {
	const alliance = await Alliance.findOne({
		where: {
			id: parseInt(data.id) || 0,
		},
	});

	if (alliance) {
		await alliance.update(
			{
				server: data.server || alliance.server,
				alliance_name: data.alliance_name || alliance.alliance_name,
				comment: data.comment || alliance.comment,
			},
			{
				where: {
					id: alliance.id,
				},
			}
		);

		await modalInteraction.reply({
			content:
				"Alliance with ID " + inlineCode(data.id) + " has been edited.",
			ephemeral: true,
		});
	} else {
		await modalInteraction.reply({
			content: "Alliance with ID " + inlineCode(data.id) + " not found.",
			ephemeral: true,
		});
	}
}
