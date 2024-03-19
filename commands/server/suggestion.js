const { SlashCommandBuilder, EmbedBuilder, messageLink } = require('discord.js');

module.exports = {
    cooldown: 60,
    category: 'server',
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('Submit a suggestion.')
        .setDMPermission(false)
        .addStringOption(option =>
            option.setName('details')
                .setDescription('Enter the details of the suggestion.')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('attachment')
                .setDescription('Attach a file to the suggestion.')
                .setRequired(false)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const details = await interaction.options.getString('details');
        const attachment = await interaction.options.getAttachment('attachment');

        const embed = new EmbedBuilder()
            .setColor('White')
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setDescription(details)
            .setTimestamp();

        if (attachment) embed.setImage(attachment.url);

        const suggestionChannel = client.channels.cache.get(process.env.SUGGESTION_CHANNEL);

        const suggestion = await suggestionChannel.send({ embeds: [embed] });

        await suggestion.react('✅').then(suggestion.react('❌'));

        await interaction.editReply({ content: 'Suggestion Submitted! ' + messageLink(suggestion.channelId, suggestion.id) });
    },
};