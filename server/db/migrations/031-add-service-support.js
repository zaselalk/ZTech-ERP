"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create Services table
        await queryInterface.createTable("Services", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },
            cost_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: null,
            },
            discount: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 0,
            },
            discount_type: {
                type: Sequelize.ENUM("Fixed", "Percentage"),
                allowNull: false,
                defaultValue: "Percentage",
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: "Duration in minutes",
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });

        // Add enableServiceManagement setting
        await queryInterface.addColumn("Settings", "enableServiceManagement", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Drop Services table
        await queryInterface.dropTable("Services");

        // Remove settings column
        await queryInterface.removeColumn("Settings", "enableServiceManagement");
    },
};
