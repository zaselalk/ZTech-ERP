"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("SupplierPayments", {
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
            PurchaseId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "Purchases",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            payment_method: {
                type: Sequelize.ENUM("Cash", "Card", "Bank Transfer", "Cheque"),
                allowNull: false,
                defaultValue: "Cash",
            },
            reference: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            paymentDate: {
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
        await queryInterface.addIndex("SupplierPayments", ["SupplierId"]);
        await queryInterface.addIndex("SupplierPayments", ["PurchaseId"]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("SupplierPayments");
    },
};
