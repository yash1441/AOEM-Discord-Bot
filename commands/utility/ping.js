const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
    cooldown: 5,
    category: "utility",
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with Pong!"),
    async execute(interaction) {
        const reply = await interaction.deferReply({
            flags: MessageFlags.Ephemeral,
            fetchReply: true,
        });

        await interaction.editReply({
            content:
                "API Latency: " +
                interaction.client.ws.ping +
                "\nClient Ping: " +
                (
                    reply.createdTimestamp - interaction.createdTimestamp
                ).toString(),
        });
    },
};
