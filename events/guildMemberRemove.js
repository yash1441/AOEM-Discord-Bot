const { Events } = require('discord.js');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/members.sqlite',
    logging: false,
});

const Members = sequelize.define('members', {
    user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    code: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '-',
    },
    guild_id: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: process.env.GUILD_ID,
    },
});

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member, client) {
        if (member.user.bot) return;
        
        const memberId = member.user.id;
        const logChannel = client.channels.cache.get(process.env.USER_LOG_CHANNEL);
        
        const [memberData, created] = await Members.findOrCreate({
            where: { user_id: memberId },
            defaults: {
                user_id: memberId,
            },
        });

        logChannel.send(memberData.user_id + ' left the server. They used code ' + memberData.code + ' to join.');
    }
};