'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookshops', 'consignment', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookshops', 'consignment');
  }
};
