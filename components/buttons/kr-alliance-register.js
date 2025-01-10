const {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    bold,
    MessageFlags,
} = require("discord.js");
const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "db/alliance.sqlite",
    logging: true,
});

const Alliance = sequelize.define(
    "kr_alliance",
    {
        user_id: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: false,
        },
        user_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        server: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        alliance_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        comment: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        createdAt: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            defaultValue: Sequelize.DataTypes.NOW, // This ensures a timestamp is set upon creation
        },
    },
    { timestamps: false }
);

module.exports = {
    cooldown: 10,
    data: {
        name: "kr-alliance-register",
    },
    async execute(interaction) {
        Alliance.sync();

        const modal = new ModalBuilder()
            .setCustomId("kr-alliance-register-modal")
            .setTitle("KR Alliance Registration");

        const server = new TextInputBuilder()
            .setCustomId("server")
            .setLabel("서버")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setRequired(true);

        const allianceName = new TextInputBuilder()
            .setCustomId("allianceName")
            .setLabel("연맹")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10)
            .setRequired(true);

        const comment = new TextInputBuilder()
            .setCustomId("comment")
            .setLabel("코멘트")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(50)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(server);
        const secondActionRow = new ActionRowBuilder().addComponents(
            allianceName
        );
        const thirdActionRow = new ActionRowBuilder().addComponents(comment);

        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

        await interaction.showModal(modal);

        interaction
            .awaitModalSubmit({ time: 300_000 })
            .then((modalInteraction) => {
                const server =
                    modalInteraction.fields.getTextInputValue("server");
                const allianceName =
                    modalInteraction.fields.getTextInputValue("allianceName");
                const comment =
                    modalInteraction.fields.getTextInputValue("comment") ?? "-";

                findOrCreateAlliance(
                    interaction.user.id,
                    interaction.user.username,
                    server,
                    allianceName,
                    comment,
                    modalInteraction
                );
            })
            .catch(console.error);
    },
};

async function findOrCreateAlliance(
    user_id,
    user_name,
    server,
    alliance_name,
    comment,
    modalInteraction
) {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const nextMonthStart = new Date(currentMonthStart);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

    const [alliance, created] = await Alliance.findOrCreate({
        where: {
            [Sequelize.Op.or]: [
                { user_id: user_id },
                { alliance_name: alliance_name },
            ],
            /*createdAt: {
				[Sequelize.Op.gte]: currentMonthStart,
				[Sequelize.Op.lt]: nextMonthStart,
			},*/
        },
        defaults: {
            user_id: user_id,
            user_name: user_name,
            server: server,
            alliance_name: alliance_name,
            comment: comment,
        },
    });

    if (created) {
        modalInteraction.reply({
            content:
                bold("서버") +
                `: ${server}\n` +
                bold("연맹") +
                `: ${alliance_name}\n` +
                bold("코멘트") +
                `: ${comment}`,
            flags: MessageFlags.Ephemeral,
        });
    } else {
        modalInteraction.reply({
            content:
                `You have already registered an alliance or there is already an alliance with a similar name.\n` +
                bold("서버") +
                `: ${alliance.server}\n` +
                bold("연맹") +
                `: ${alliance.alliance_name}\n` +
                bold("코멘트") +
                `: ${alliance.comment}`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
