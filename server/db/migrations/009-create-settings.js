'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Settings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            businessName: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'My Business'
            },
            address: {
                type: Sequelize.STRING,
                allowNull: true
            },
            phone: {
                type: Sequelize.STRING,
                allowNull: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: true
            },
            website: {
                type: Sequelize.STRING,
                allowNull: true
            },
            receiptFooter: {
                type: Sequelize.STRING,
                allowNull: true,
                defaultValue: 'Thank you for your business!'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Insert default settings
        await queryInterface.bulkInsert('Settings', [{
            businessName: 'ZTech POS',
            address: '123 Main St, City',
            phone: '0123456789',
            email: 'info@example.com',
            receiptFooter: 'Thank you for shopping with us!',
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Settings');
    }
};
