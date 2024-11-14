const {
	codeBlock,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	PermissionsBitField,
} = require("discord.js");
const Sequelize = require("sequelize");
const { table } = require("table");
require("dotenv").config();

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "db/alliance.sqlite",
	logging: true,
});

const Alliance = sequelize.define(
	"jp_alliance",
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

const config = {
	border: {
		topBody: `─`,
		topJoin: `┬`,
		topLeft: `┌`,
		topRight: `┐`,

		bottomBody: `─`,
		bottomJoin: `┴`,
		bottomLeft: `└`,
		bottomRight: `┘`,

		bodyLeft: `│`,
		bodyRight: `│`,
		bodyJoin: `│`,

		joinBody: `─`,
		joinLeft: `├`,
		joinRight: `┤`,
		joinJoin: `┼`,
	},
};

module.exports = {
	cooldown: 10,
	data: {
		name: "jp-check-alliance",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		Alliance.sync();

		const editButton = new ButtonBuilder()
			.setCustomId("jp-edit-alliance")
			.setLabel("Edit")
			.setStyle(ButtonStyle.Primary);

		const deleteButton = new ButtonBuilder()
			.setCustomId("jp-delete-alliance")
			.setLabel("Delete")
			.setStyle(ButtonStyle.Danger);

		const buttonRow = new ActionRowBuilder().addComponents(
			editButton,
			deleteButton
		);

		const currentMonthStart = new Date();
		currentMonthStart.setDate(1);
		currentMonthStart.setHours(0, 0, 0, 0);
		const nextMonthStart = new Date(currentMonthStart);
		nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

		const records = await Alliance.findAll({
			where: {
				createdAt: {
					[Sequelize.Op.gte]: currentMonthStart,
					[Sequelize.Op.lt]: nextMonthStart,
				},
			},
		});

		const data = [];
		data.push(["ID", "User", "Server", "Alliance Name", "Comment"]);

		for (const record of records) {
			data.push([
				record.dataValues.id,
				record.dataValues.user_name,
				record.dataValues.server,
				record.dataValues.alliance_name,
				record.dataValues.comment,
			]);
		}

		if (
			interaction.member.permissions.has(
				PermissionsBitField.Administrator
			)
		)
			return await interaction.editReply({
				content: codeBlock(table(data, config)),
				components: [buttonRow],
			});

		await interaction.editReply({
			content: codeBlock(table(data, config)),
		});
	},
};
