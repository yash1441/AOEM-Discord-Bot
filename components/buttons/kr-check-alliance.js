const { EmbedBuilder, bold } = require("discord.js");
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
		name: "kr-check-alliance",
	},
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true });
		Alliance.sync();

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

        let message = '';

        for (const record of records) {
            message += `${record.dataValues.user_name} - ${record.dataValues.server} - ${record.dataValues.alliance_name} - ${record.dataValues.comment}\n`;
        }

		await interaction.editReply({ content: message });
	},
};
