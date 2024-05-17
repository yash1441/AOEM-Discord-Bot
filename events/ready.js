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

		const guild = await client.guilds.fetch(process.env.GUILD_ID);
		const invites = await guild.invites.fetch({ force: true }).catch(console.error);
		for (const [code, invite] of invites) {
			const [existingInvite, created] = await TotalInvites.findOrCreate({
				where: { code: code},
				defaults: { code: code, user_id: invite.inviterId, uses: invite.uses, guild_id: process.env.GUILD_ID },
			});
			if (created) continue ;
			if (existingInvite.uses == invite.uses) continue;
			existingInvite.update({ uses: invite.uses });
		}
	},
};