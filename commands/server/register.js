const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
    MessageFlags,
} = require("discord.js");

module.exports = {
    cooldown: 60,
    category: "server",
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("Registration related commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("setup")
                .setDescription("Setup register embed and buttons")
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const embed = new EmbedBuilder()
            .setTitle("Pioneer Server Registration")
            .setColor("White")
            .setDescription("Register for Pioneer server.")
            .setFooter({
                text: "Age of Empires Mobile",
                iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
            });

        const registerButton = new ButtonBuilder()
            .setLabel("Register")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("register-pioneer")
            .setEmoji("📃");

        const checkButton = new ButtonBuilder()
            .setLabel("Check")
            .setStyle(ButtonStyle.Success)
            .setCustomId("check-pioneer")
            .setEmoji("🔍");

        const row = new ActionRowBuilder().addComponents(
            registerButton,
            checkButton
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });

        await interaction.editReply({
            content: "Registration setup complete!",
        });
    },
};
