"use strict";
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("QuotationItems", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            QuotationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Quotations",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            BookId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Books",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            discount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            discount_type: {
                type: Sequelize.ENUM("Fixed", "Percentage"),
                allowNull: false,
                defaultValue: "Fixed",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("QuotationItems");
    },
};
