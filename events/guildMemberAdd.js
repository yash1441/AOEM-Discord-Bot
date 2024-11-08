const { Events } = require('discord.js');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize1 = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/invites.sqlite',
    logging: false,
});

const Invites = sequelize1.define('invites', {
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

const sequelize2 = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/members.sqlite',
    logging: false,
});

const Members = sequelize2.define('members', {
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
    name: Events.GuildMemberAdd,
    async execute(member, client) {
        const memberId = member.user.id;
        const logChannel = client.channels.cache.get(process.env.USER_LOG_CHANNEL);
        
        if (member.user.bot) return logChannel.send(memberId + ' joined via bot invite.');

        const existingMember = await Members.findOne({ where: { user_id: memberId } });
        if (existingMember) return logChannel.send(memberId + ' joined the server again.');

        const newInvitesData = await member.guild.invites.fetch({ cache: false }).catch(console.error);
        const newInvitesMap = {};
        for (const [code, invite] of newInvitesData) {
            const { inviterId, uses } = invite;
            newInvitesMap[code] = { user_id: inviterId, uses };
        }

        const totalInvites = await member.client.invites.get(process.env.GUILD_ID);
        const usedInvite = newInvitesData.find(inv => totalInvites.find(i => i.code === inv.code).uses < inv.uses) || null;

        if (!usedInvite) {
            return logChannel.send(memberId + ' joined the server through unknown means.');
        }

        logChannel.send(memberId + ' joined using ', usedInvite.code);
        await Members.create({ user_id: memberId, code: usedInvite.code });
        await Invites.increment({ 'uses': 1, 'total_uses': 1 }, { where: { code: usedInvite.code } });

        const currentInvites = new Array();
		for (const [code, invite] of newInvitesData) {
			currentInvites.push({ code: code, uses: invite.uses, inviter: invite.inviter });
		}
		await member.client.invites.set(process.env.GUILD_ID, currentInvites); 
    }
};