const { Events, ActivityType } = require('discord.js');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/total_invites.sqlite',
    logging: false,
});

const TotalInvites = sequelize.define('total_invites', {
    code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    uses: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: process.env.GUILD_ID,
    },
});

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence({
			activities: [
				{
					name: 'Age of Empires Mobile',
					type: ActivityType.Custom,
					state: "Age of Empires Mobile"
				},
			],
			status: 'online'
		});
	},
};