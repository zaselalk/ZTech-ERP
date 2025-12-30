"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add enableTaxManagement column
        await queryInterface.addColumn("Settings", "enableTaxManagement", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Add taxName column
        await queryInterface.addColumn("Settings", "taxName", {
            type: Sequelize.STRING,
            allowNull: true,
            defaultValue: null,
        });

        // Add taxRate column
        await queryInterface.addColumn("Settings", "taxRate", {
            type: Sequelize.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: null,
        });

        // Add taxIncludedInPrice column
        await queryInterface.addColumn("Settings", "taxIncludedInPrice", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Settings", "enableTaxManagement");
        await queryInterface.removeColumn("Settings", "taxName");
        await queryInterface.removeColumn("Settings", "taxRate");
        await queryInterface.removeColumn("Settings", "taxIncludedInPrice");
    },
};
