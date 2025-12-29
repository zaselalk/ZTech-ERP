"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add cost_price to Products table
        await queryInterface.addColumn("Products", "cost_price", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        });

        // Add cost_price to SaleItems table (to record cost at time of sale for accurate profit calculation)
        await queryInterface.addColumn("SaleItems", "cost_price", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("Products", "cost_price");
        await queryInterface.removeColumn("SaleItems", "cost_price");
    },
};
