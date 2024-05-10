const { Events } = require('discord.js');
require('dotenv').config();

module.exports = {
    name: Events.InviteDelete,
    async execute(invite) {
        console.log(invite.code, ' has been deleted.');
    }
};