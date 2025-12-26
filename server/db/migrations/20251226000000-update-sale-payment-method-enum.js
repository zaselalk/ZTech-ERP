'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('Sales', 'payment_method', {
            type: Sequelize.ENUM('Cash', 'Card', 'Consignment', 'Paid', 'Cash On Delivery'),
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        // Note: This down migration might fail if there are records with 'Paid' or 'Cash On Delivery'
        await queryInterface.changeColumn('Sales', 'payment_method', {
            type: Sequelize.ENUM('Cash', 'Card', 'Consignment'),
            allowNull: false,
        });
    }
};
