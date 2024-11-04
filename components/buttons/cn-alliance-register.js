const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'cn-alliance-register',
    },
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('cn-alliance-register-modal')
            .setTitle('CN Alliance Registration');

        const server = new TextInputBuilder()
            .setCustomId('server')
            .setLabel('Server')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const allianceName = new TextInputBuilder()
            .setCustomId('allianceName')
            .setLabel('Alliance Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const comment = new TextInputBuilder()
            .setCustomId('comment')
            .setLabel('Comment')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(server);
        const secondActionRow = new ActionRowBuilder().addComponents(allianceName);
        const thirdActionRow = new ActionRowBuilder().addComponents(comment);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);

        interaction.awaitModalSubmit({ time: 300_000 })
            .then((modalInteraction) => {
                const server = modalInteraction.fields.getTextInputValue('server');
                const allianceName = modalInteraction.fields.getTextInputValue('allianceName');
                const comment = modalInteraction.fields.getTextInputValue('comment');

                modalInteraction.reply({ content: `Server: ${server}\nAlliance Name: ${allianceName}\nComment: ${comment}` });
            })
            .catch(console.error);
    },
};