'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Relax constraints for Bookshops
        await queryInterface.changeColumn('Bookshops', 'location', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.changeColumn('Bookshops', 'contact', {
            type: Sequelize.STRING,
            allowNull: true
        });


    },

    async down(queryInterface, Sequelize) {
        // Revert constraints for Bookshops
        await queryInterface.changeColumn('Bookshops', 'location', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.changeColumn('Bookshops', 'contact', {
            type: Sequelize.STRING,
            allowNull: false
        });
    }
};
