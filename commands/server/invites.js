const { SlashCommandBuilder, PermissionFlagsBits, userMention, codeBlock } = require('discord.js');
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
            await Invites.sync();
            await Invites.truncate();
            return await interaction.reply({ content: 'Invites leaderboard has been reset.', ephemeral: true });
        } else if (subCommand === 'leaderboard') {
            await interaction.deferReply({ content: 'Generating leaderboard...' });
            const invites = await Invites.findAll({
                attributes: ['user_id', 'uses'],
            });
            const finalInvites = [];
            for (const invite of invites) {
                const { user_id, uses } = invite;
                const existingInvite = finalInvites.find(invite => invite.user_id === user_id);
                (existingInvite) ? existingInvite.uses += uses : finalInvites.push({ user_id, uses });
            }
            finalInvites.sort((a, b) => b.uses - a.uses);
            const top10 = finalInvites.slice(0, 10);
            let message = ''
            for (const invite of top10) {
                const user = userMention(invite.user_id);
                message += `${user}: ${invite.uses}\n`;
            }
            await interaction.editReply({ content: 'Invites leaderboard for this week:\n' + message });
        }
    },
};