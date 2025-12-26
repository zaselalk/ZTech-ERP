'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Update existing null values to defaults
        await queryInterface.sequelize.query(`UPDATE Books SET quantity = 0 WHERE quantity IS NULL`);
        await queryInterface.sequelize.query(`UPDATE Books SET price = 0 WHERE price IS NULL`);
        await queryInterface.sequelize.query(`UPDATE Books SET reorder_threshold = 1 WHERE reorder_threshold IS NULL`);

        // Apply constraints
        await queryInterface.changeColumn('Books', 'name', {
            type: Sequelize.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('Books', 'quantity', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.changeColumn('Books', 'price', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        });

        await queryInterface.changeColumn('Books', 'reorder_threshold', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1
        });

        await queryInterface.addConstraint('Books', {
            fields: ['barcode'],
            type: 'unique',
            name: 'unique_barcode_constraint'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('Books', 'unique_barcode_constraint');

        await queryInterface.changeColumn('Books', 'name', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.changeColumn('Books', 'quantity', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.changeColumn('Books', 'price', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        });

        await queryInterface.changeColumn('Books', 'reorder_threshold', {
            type: Sequelize.INTEGER,
            allowNull: true
        });
    }
};
