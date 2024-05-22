const { SlashCommandBuilder, PermissionFlagsBits, userMention, codeBlock, MessageFlags, EmbedBuilder } = require('discord.js');
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
    cooldown: 1,
    category: 'server',
    data: new SlashCommandBuilder()
        .setName('invites')
        .setDescription('Invites related commands')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('Check the invites leaderboard for this week')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset the invites leaderboard')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('raw-query')
                .setDescription('Query an invites database')
                .addStringOption(option =>
                    option.setName('database')
                        .setDescription('Choose a database')
                        .setRequired(true)
                        .addChoices(
                            { name: 'invites', value: 'invites' },
                            { name: 'members', value: 'members' },
                        )
                )
                .addStringOption(option =>
                    option.setName('query')
                        .setDescription('Enter the query')
                        .setRequired(true)
                )
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

            const weeklyEmbed = new EmbedBuilder()
                .setTitle('Top Weekly')
                .setColor('#2B2D31');

            for (const invite of topWeekly) {
                const user = await interaction.guild.members.cache.get(invite.user_id).user;
                weeklyEmbed.addFields({ name: user.username, value: invite.uses?.toString() ?? '-', inline: false });
            }

            const allTimeEmbed = new EmbedBuilder()
                .setTitle('Top Alltime')
                .setColor('#2B2D31');

            for (const invite of topAllTime) {
                const user = await interaction.guild.members.cache.get(invite.user_id).user;
                allTimeEmbed.addFields({ name: user.username, value: invite.uses?.toString() ?? '-', inline: false });
            }
            await interaction.editReply({ content: '## Invites Leaderboard', embeds: [weeklyEmbed, allTimeEmbed], flags: [MessageFlags.SuppressNotifications] });
        } else if (subCommand === 'raw-query') {
            if (interaction.user.id != process.env.MY_ID) return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
            const db = interaction.options.getString('database');
            const query = interaction.options.getString('query');

            if (db == 'invites') {
                const response = await Invites.sequelize.query(query);
                return await interaction.reply({ content: codeBlock(JSON.stringify(response)), ephemeral: true });
            } else if (db == 'members') {
                const response = await Members.sequelize.query(query);
                return await interaction.reply({ content: codeBlock(JSON.stringify(response)), ephemeral: true });
            }
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