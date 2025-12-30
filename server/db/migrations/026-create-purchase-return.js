"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("PurchaseReturns", {
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
                onDelete: "RESTRICT",
            },
            SupplierId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Suppliers",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "RESTRICT",
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            refund_status: {
                type: Sequelize.ENUM("Pending", "Partial", "Completed"),
                allowNull: false,
                defaultValue: "Pending",
            },
            refund_received: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
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
        await queryInterface.addIndex("PurchaseReturns", ["PurchaseId"]);
        await queryInterface.addIndex("PurchaseReturns", ["SupplierId"]);
        await queryInterface.addIndex("PurchaseReturns", ["refund_status"]);
        await queryInterface.addIndex("PurchaseReturns", ["returnDate"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("PurchaseReturns");
    },
};
