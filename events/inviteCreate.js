const { Events } = require('discord.js');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/invites.sqlite',
    logging: false,
});

const Invites = sequelize.define('invites', {
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
        defaultValue: 0,
    },
    total_uses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: process.env.GUILD_ID,
    },
});

module.exports = {
    name: Events.InviteCreate,
    async execute(invite) {
        if (!invite.inviterId) return console.log(invite.code, ' created without an inviterId.');
        const invitesData = await invite.guild.invites.fetch().catch(console.error);
		const invites = new Array();
		for (const [code, invite] of invitesData) {
			invites.push({ code: code, uses: invite.uses, inviter: invite.inviter });
		}

		await invite.client.invites.set(process.env.GUILD_ID, invites); 

        const code = invite.code;
        const inviterId = invite.inviterId;

        const inviteData = await Invites.create({
            code: code,
            user_id: inviterId,
        });

        console.log(inviteData.code, ' created by ', inviteData.user_id, ' defaulted to ', inviteData.uses, ' uses.');
    }
};