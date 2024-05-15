const { SlashCommandBuilder, PermissionFlagsBits, userMention, codeBlock, MessageFlags } = require('discord.js');
const Sequelize = require('sequelize');

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
            const topWeekly = getTop10Invites(invites, 'uses');
            const topAllTime = getTop10Invites(invites, 'total_uses');
            let message = '### Top Weekly\n'
            for (const invite of topWeekly) {
                const user = userMention(invite.user_id);
                message += `${user}: ${invite.uses}\n`;
            }
            message += '\n\n### Top Alltime\n';
            for (const invite of topAllTime) {
                const user = userMention(invite.user_id);
                message += `${user}: ${invite.total_uses}\n`;
            }
            await interaction.editReply({ content: '## Invites Leaderboard\n' + message, flags: [MessageFlags.SuppressNotifications] });
        }
    },
};

function getTop10Invites(invites, column) {
    const finalInvites = [];
    switch (column) {
        case 'uses':
            for (const invite of invites) {
                const { user_id, uses, total_uses } = invite;
                const existingInvite = finalInvites.find(invite => invite.user_id === user_id);
                (existingInvite) ? existingInvite.uses += uses : finalInvites.push({ user_id, uses });
            }
            break;
        case 'total_uses':
            for (const invite of invites) {
                const { user_id, uses, total_uses } = invite;
                const existingInvite = finalInvites.find(invite => invite.user_id === user_id);
                (existingInvite) ? existingInvite.total_uses += total_uses : finalInvites.push({ user_id, total_uses });
            }
            break;
        default:
            return false;
    }

    finalInvites.sort((a, b) => b[column] - a[column]);
    return finalInvites.slice(0, 10);
}