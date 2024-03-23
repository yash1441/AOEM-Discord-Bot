const { } = require('discord.js');
require('dotenv').config();

module.exports = {
    cooldown: 10,
    data: {
        name: 'endConversation',
    },
    async execute(interaction) {
        await interaction.reply({ content: 'Ending conversation and deleting this thread...' });

        setTimeout(function() {
            interaction.channel.delete();
          }, 2_000);
    },
};