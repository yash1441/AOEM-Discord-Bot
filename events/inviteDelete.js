const { Events } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.InviteDelete,
    async execute(invite) {
        const logChannel = invite.client.channels.cache.get(process.env.USER_LOG_CHANNEL);
        logChannel.send(invite.code + ' has been deleted.');
    }
};