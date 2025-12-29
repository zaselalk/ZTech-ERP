"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add cost_price to Products table (nullable - only required when profit tracking is enabled)
        await queryInterface.addColumn("Products", "cost_price", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null,
        });

        // Add cost_price to SaleItems table (to record cost at time of sale for accurate profit calculation)
        await queryInterface.addColumn("SaleItems", "cost_price", {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: null,
            await queryInterface.removeColumn("SaleItems", "cost_price");
        },
};
