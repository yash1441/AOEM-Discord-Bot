const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
    cooldown: 10,
    data: {
        name: "register-pioneer",
    },
    async execute(interaction) {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("platform-pioneer")
            .setPlaceholder("Choose your platform")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Android")
                    .setValue("Android")
                    .setEmoji("🤖"),
                new StringSelectMenuOptionBuilder()
                    .setLabel("iOS")
                    .setValue("iOS")
                    .setEmoji("🍏")
            );

        const selectMenuRow = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: "Please select your platform",
            components: [selectMenuRow],
            flags: MessageFlags.Ephemeral,
        });
    },
};
