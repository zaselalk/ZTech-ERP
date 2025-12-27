'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('SaleItems', 'bookName', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('SaleItems', 'bookAuthor', {
            type: Sequelize.STRING,
            allowNull: true,
        });
        await queryInterface.addColumn('SaleItems', 'bookBarcode', {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('SaleItems', 'bookName');
        await queryInterface.removeColumn('SaleItems', 'bookAuthor');
        await queryInterface.removeColumn('SaleItems', 'bookBarcode');
    }
};
