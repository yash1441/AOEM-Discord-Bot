const { Events } = require('discord.js');
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize1 = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/total_invites.sqlite',
    logging: false,
});

const TotalInvites = sequelize1.define('total_invites', {
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

const sequelize2 = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/invites.sqlite',
    logging: false,
});

const Invites = sequelize2.define('invites', {
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

const sequelize3 = new Sequelize({
    dialect: 'sqlite',
    storage: 'db/members.sqlite',
    logging: false,
});

const Members = sequelize3.define('members', {
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
    async execute(member) {
        const memberId = member.user.id;
        if (member.user.bot) return console.log(memberId, ' joined via bot invite.');

        const existingMember = await Members.findOne({ where: { user_id: memberId } });
        if (existingMember) return console.log(memberId, ' joined the server again.');

        const guild = await member.guild;
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

        const newInvitesData = await guild.invites.fetch({ force: true }).catch(console.error);
        const newInvitesMap = {};
        for (const [code, invite] of newInvitesData) {
            const { inviterId, uses } = invite;
            newInvitesMap[code] = { user_id: inviterId, uses };
        }

        const TotalInvitesData = await TotalInvites.findAll({
            where: { guild_id: process.env.GUILD_ID },
            attributes: ['code', 'user_id', 'uses'],
        });

        const TotalInvitesMap = {};
        for (const invite of TotalInvitesData) {
            const { code, user_id, uses } = invite;
            TotalInvitesMap[code] = { user_id, uses };
        }

        const increasedCode = findIncreasedUses(newInvitesMap, TotalInvitesMap);
        if (!increasedCode) {
            console.log({ newInvitesMap, TotalInvitesMap });
            return console.log(memberId, ' joined the server through unknown means.');
        }

        console.log(memberId, ' joined using ', increasedCode);
        await Members.create({ user_id: memberId, code: increasedCode });
        await TotalInvites.update({ uses: newInvitesMap[increasedCode].uses }, { where: { code: increasedCode } });
        await Invites.increment({ 'uses': 1, 'total_uses': 1 }, { where: { code: increasedCode } });
    }
};

function findIncreasedUses(newInvitesMap, TotalInvitesMap) {
    let changedCode = false
    for (const code in newInvitesMap) {
        const newUses = newInvitesMap[code].uses;
        const oldUses = TotalInvitesMap[code]?.uses;
        if (!oldUses) continue;
        if (newUses > oldUses) {
            changedCode = code;
            return changedCode;
        }
    }
    return changedCode;
};