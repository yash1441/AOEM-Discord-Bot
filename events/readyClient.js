const { Events, ActivityType } = require("discord.js");
require("dotenv").config();

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setPresence({
			activities: [
				{
					name: "Age of Empires Mobile",
					type: ActivityType.Custom,
					state: "Age of Empires Mobile",
				},
			],
			status: "online",
		});

		const guild = await client.guilds.fetch(process.env.GUILD_ID);
		const invitesData = await guild.invites
			.fetch({ cache: false })
			.catch(console.error);
		const invites = new Array();
		for (const [code, invite] of invitesData) {
			invites.push({ code: code, uses: invite.uses, inviter: invite.inviter });
		}

		await client.invites.set(process.env.GUILD_ID, invites);
	},
};
