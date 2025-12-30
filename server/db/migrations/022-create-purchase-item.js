"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("PurchaseItems", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            PurchaseId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Purchases",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            ProductId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "Products",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            productName: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            unit_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            total_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });

        // Add indexes
        await queryInterface.addIndex("PurchaseItems", ["PurchaseId"]);
        await queryInterface.addIndex("PurchaseItems", ["ProductId"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("PurchaseItems");
    },
};
