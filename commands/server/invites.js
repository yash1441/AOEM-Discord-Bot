const { SlashCommandBuilder, PermissionFlagsBits, userMention, codeBlock } = require('discord.js');
const Sequelize = require('sequelize');

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
    storage: 'db/total_invites.sqlite',
    logging: false,
});

const TotalInvites = sequelize2.define('total_invites', {
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
    cooldown: 60,
    category: 'server',
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Invites related commands')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Check the invites leaderboard for this week')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset the invites leaderboard')
        ),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        if (subCommand === 'reset') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            await Invites.update({ 'uses': 0 }, { where: {} });
            return await interaction.reply({ content: 'Invites leaderboard has been reset.', ephemeral: true });
        } else if (subCommand === 'leaderboard') {
            await interaction.deferReply({ content: 'Generating leaderboard...' });
            const invites = await Invites.findAll({
                attributes: ['user_id', 'uses', 'total_uses'],
            });
            const TotalInvites = await Invites.findAll({
                attributes: ['user_id', 'uses'],
            });
            const topWeekly = getTop10Invites(invites);
            const top = getTop10Invites(TotalInvites);
            let message = '**Top Weekly**'
            for (const invite of topWeekly) {
                const user = userMention(invite.user_id);
                message += `${user}: ${invite.uses}\n`;
            }
            message += '\n\n**Top Alltime**';
            for (const invite of top) {
                const user = userMention(invite.user_id);
                message += `${user}: ${invite.uses}\n`;
            }
            await interaction.editReply({ content: '## Invites Leaderboard\n' + message });
        }
    },
};

function getTop10Invites(invites) {
    const finalInvites = [];
    for (const invite of invites) {
        const { user_id, uses, total_uses } = invite;
        const existingInvite = finalInvites.find(invite => invite.user_id === user_id);
        (existingInvite) ? existingInvite.uses += uses : finalInvites.push({ user_id, uses });
    }
    finalInvites.sort((a, b) => b.uses - a.uses);
    return finalInvites.slice(0, 10);
}