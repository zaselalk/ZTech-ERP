'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Bookshops', [
      {
        name: 'City Center Books',
        location: '123 Main St, Downtown',
        contact: '555-1234',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Uptown Reads',
        location: '456 Oak Ave, Uptown',
        contact: '555-5678',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookshops', null, {});
  }
};