"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("SaleReturns", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            SaleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Sales",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            CustomerId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "Customers",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            refund_method: {
                type: Sequelize.ENUM("Cash", "Card", "Credit", "Exchange"),
                allowNull: false,
                defaultValue: "Cash",
            },
            reason: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            returnDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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
        await queryInterface.addIndex("SaleReturns", ["SaleId"]);
        await queryInterface.addIndex("SaleReturns", ["CustomerId"]);
        await queryInterface.addIndex("SaleReturns", ["returnDate"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("SaleReturns");
    },
};
