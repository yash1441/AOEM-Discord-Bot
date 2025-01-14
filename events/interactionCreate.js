const { Events, Collection, MessageFlags } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(
                interaction.commandName
            );

            if (!command) {
                console.error(
                    `No command matching ${interaction.commandName} was found.`
                );
                return;
            }

            const cooldown = await checkCooldown(interaction, command);

            if (cooldown.cooldown) {
                return await interaction.reply({
                    content: cooldown.message,
                    flags: MessageFlags.Ephemeral,
                });
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content:
                            "There was an error while executing this command!",
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.reply({
                        content:
                            "There was an error while executing this command!",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        } else if (interaction.isButton()) {
            const button = interaction.client.buttons.get(interaction.customId);

            if (!button) {
                return console.error(
                    `No button matching ${interaction.customId} was found.`
                );
            }

            const cooldown = await checkCooldown(interaction, button);

            if (cooldown.cooldown) {
                return await interaction.reply({
                    content: cooldown.message,
                    flags: MessageFlags.Ephemeral,
                });
            }

            try {
                await button.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content:
                            "There was an error while executing this button!",
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.reply({
                        content:
                            "There was an error while executing this button!",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            const stringSelectMenu = interaction.client.selectmenus.get(
                interaction.customId
            );

            if (!stringSelectMenu) {
                return console.error(
                    `No select menu matching ${interaction.customId} was found.`
                );
            }

            try {
                await stringSelectMenu.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content:
                            "There was an error while executing this select menu!",
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.reply({
                        content:
                            "There was an error while executing this select menu!",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
        }
    },
};

async function checkCooldown(interaction, element) {
    const { cooldowns } = interaction.client;

    if (!cooldowns.has(element.data.name)) {
        cooldowns.set(element.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(element.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount =
        (element.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime =
            timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1_000);

            return {
                cooldown: true,
                message: `Please wait, you are on a cooldown for \`${element.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
            };
        }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    return { cooldown: false, message: "" };
}
