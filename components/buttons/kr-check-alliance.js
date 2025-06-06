const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionsBitField,
    AttachmentBuilder,
    MessageFlags,
} = require("discord.js");
const Sequelize = require("sequelize");
const { table } = require("table");
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

const config = {
    border: {
        topBody: `─`,
        topJoin: `┬`,
        topLeft: `┌`,
        topRight: `┐`,

        bottomBody: `─`,
        bottomJoin: `┴`,
        bottomLeft: `└`,
        bottomRight: `┘`,

        bodyLeft: `│`,
        bodyRight: `│`,
        bodyJoin: `│`,

        joinBody: `─`,
        joinLeft: `├`,
        joinRight: `┤`,
        joinJoin: `┼`,
    },
};

module.exports = {
    cooldown: 10,
    data: {
        name: "kr-check-alliance",
    },
    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        Alliance.sync();

        const editButton = new ButtonBuilder()
            .setCustomId("kr-edit-alliance")
            .setLabel("Edit")
            .setStyle(ButtonStyle.Primary);

        const deleteButton = new ButtonBuilder()
            .setCustomId("kr-delete-alliance")
            .setLabel("Delete")
            .setStyle(ButtonStyle.Danger);

        const buttonRow = new ActionRowBuilder().addComponents(
            editButton,
            deleteButton
        );

        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const nextMonthStart = new Date(currentMonthStart);
        nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);

        const records = await Alliance.findAll(/*{
			where: {
				createdAt: {
					[Sequelize.Op.gte]: currentMonthStart,
					[Sequelize.Op.lt]: nextMonthStart,
				},
			},
		}*/);

        const data = [];
        data.push(["ID", "User", "Server", "Alliance Name", "Comment"]);

        for (const record of records) {
            data.push([
                record.dataValues.id,
                record.dataValues.user_name,
                record.dataValues.server,
                record.dataValues.alliance_name,
                record.dataValues.comment,
            ]);
        }

        const content = Buffer.from(table(data, config));

        const attachment = new AttachmentBuilder(content, {
            name: "kr_alliance.txt",
        });

        if (
            interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator
            )
        )
            return await interaction.editReply({
                files: [attachment],
                components: [buttonRow],
            });

        await interaction.editReply({
            files: [attachment],
        });
    },
};
