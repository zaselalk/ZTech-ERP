'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Books', 'BookshopId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Books', 'BookshopId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Bookshops',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};