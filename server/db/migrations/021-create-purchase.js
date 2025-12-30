"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Purchases", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
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
            invoiceNumber: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            paid_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            payment_status: {
                type: Sequelize.ENUM("Unpaid", "Partial", "Paid"),
                allowNull: false,
                defaultValue: "Unpaid",
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            purchaseDate: {
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

        // Add index for supplier lookup
        await queryInterface.addIndex("Purchases", ["SupplierId"]);
        await queryInterface.addIndex("Purchases", ["payment_status"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Purchases");
    },
};
