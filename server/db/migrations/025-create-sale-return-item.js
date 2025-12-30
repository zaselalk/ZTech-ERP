"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("SaleReturnItems", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            SaleReturnId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "SaleReturns",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            SaleItemId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "SaleItems",
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
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            cost_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            refund_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            reason: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            restockInventory: {
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
        await queryInterface.addIndex("SaleReturnItems", ["SaleReturnId"]);
        await queryInterface.addIndex("SaleReturnItems", ["ProductId"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("SaleReturnItems");
    },
};
