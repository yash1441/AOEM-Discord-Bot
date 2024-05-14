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
        const code = invite.code;
        const inviterId = invite.inviterId;

        await Invites.sync({ alter: true });
        const inviteData = await Invites.create({
            code: code,
            user_id: inviterId,
        });

        console.log(inviteData.code, ' created by ', inviteData.user_id, ' defaulted to ', inviteData.uses, ' uses.');
    }
};