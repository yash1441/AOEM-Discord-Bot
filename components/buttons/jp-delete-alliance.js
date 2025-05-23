const {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    inlineCode,
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
    "jp_alliance",
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
        name: "jp-delete-alliance",
    },
    async execute(interaction) {
        Alliance.sync();

        const modal = new ModalBuilder()
            .setCustomId("jp-delete-alliance-modal")
            .setTitle("Delete");

        const idInput = new TextInputBuilder()
            .setCustomId("id")
            .setLabel("Enter the ID")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(idInput);

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);

        interaction
            .awaitModalSubmit({ time: 60_000 })
            .then((modalInteraction) => {
                const id = modalInteraction.fields.getTextInputValue("id");

                findAndDeleteAlliance(id, modalInteraction);
            })
            .catch(console.error);
    },
};

async function findAndDeleteAlliance(id, modalInteraction) {
    const alliance = await Alliance.findOne({
        where: {
            id: parseInt(id) || 0,
        },
    });

    if (alliance) {
        await alliance.destroy();

        await modalInteraction.reply({
            content:
                "Alliance with ID " + inlineCode(id) + " has been deleted.",
            flags: MessageFlags.Ephemeral,
        });
    } else {
        await modalInteraction.reply({
            content: "Alliance with ID " + inlineCode(id) + " not found.",
            flags: MessageFlags.Ephemeral,
        });
    }
}
