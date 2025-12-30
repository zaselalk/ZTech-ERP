"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add enableVariantManagement column to Settings
        await queryInterface.addColumn("Settings", "enableVariantManagement", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Create ProductVariants table
        await queryInterface.createTable("ProductVariants", {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            ProductId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Products",
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Variant name, e.g., 'Red - Large', 'Blue - Small'",
            },
            sku: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
                comment: "Stock Keeping Unit for this variant",
            },
            barcode: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: "Override price for this variant, null means use parent product price",
            },
            cost_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: "Override cost price for this variant",
            },
            quantity: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            attributes: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: "JSON object storing variant attributes like {color: 'Red', size: 'Large'}",
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

        // Add index on ProductId for faster lookups
        await queryInterface.addIndex("ProductVariants", ["ProductId"]);
    },

    async down(queryInterface, Sequelize) {
        // Remove ProductVariants table
        await queryInterface.dropTable("ProductVariants");

        // Remove enableVariantManagement column
        await queryInterface.removeColumn("Settings", "enableVariantManagement");
    },
};
