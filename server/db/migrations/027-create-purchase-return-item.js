"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("PurchaseReturnItems", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            PurchaseReturnId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "PurchaseReturns",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            PurchaseItemId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "PurchaseItems",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
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
            },
            unit_cost: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            refund_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            reason: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            updateInventory: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
        await queryInterface.addIndex("PurchaseReturnItems", ["PurchaseReturnId"]);
        await queryInterface.addIndex("PurchaseReturnItems", ["ProductId"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("PurchaseReturnItems");
    },
};
