const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionFlagsBits,
    MessageFlags,
} = require("discord.js");
const Sheets = require("../../utils/sheets");

module.exports = {
    cooldown: 60,
    category: "server",
    data: new SlashCommandBuilder()
        .setName("alliance")
        .setDescription("Alliance related commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("setup")
                .setDescription("Setup alliance embed and buttons")
        ),
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const embed = new EmbedBuilder()
            .setTitle("Alliance Recruitment Usage Rules")
            .setColor("White")
            .setDescription(
                "1. This bot is designed to help governors recruit alliance members conveniently. Governors who wish to recruit should fill in the relevant information as prompted.\n2. Please ensure that the content you fill in complies with server rules. Any content violating the rules may be deleted or modified by administrators.\n3. Each alliance is limited to one registration. Please do not register multiple times.\n4. Registration information will be cleared monthly. Governors who wish to continue recruiting should register again."
            )
            .setFooter({
                text: "Age of Empires Mobile",
                iconURL: "https://i.ibb.co/Fm4fttV/Logo.png",
            });

        const jpAllianceButton = new ButtonBuilder()
            .setLabel("JP Register")
            .setStyle(ButtonStyle.Success)
            .setCustomId("jp-alliance-register")
            .setEmoji("📜");

        const krAllianceButton = new ButtonBuilder()
            .setLabel("KR Register")
            .setStyle(ButtonStyle.Success)
            .setCustomId("kr-alliance-register")
            .setEmoji("📜");

        const jpCheckButton = new ButtonBuilder()
            .setLabel("JP Check")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("jp-check-alliance")
            .setEmoji("🔍");

        const krCheckButton = new ButtonBuilder()
            .setLabel("KR Check")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("kr-check-alliance")
            .setEmoji("🔍");

        const firstRow = new ActionRowBuilder().addComponents(
            jpAllianceButton,
            krAllianceButton
        );

        const secondRow = new ActionRowBuilder().addComponents(
            jpCheckButton,
            krCheckButton
        );

        await interaction.channel.send({
            embeds: [embed],
            components: [firstRow, secondRow],
        });

        await interaction.editReply({ content: "Alliance setup complete!" });
    },
};
