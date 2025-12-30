"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add enableCategoryManagement column
        await queryInterface.addColumn("Settings", "enableCategoryManagement", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Add enableBrandManagement column
        await queryInterface.addColumn("Settings", "enableBrandManagement", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Settings", "enableCategoryManagement");
        await queryInterface.removeColumn("Settings", "enableBrandManagement");
    },
};
