'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SaleItems', 'discount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    });
    await queryInterface.addColumn('SaleItems', 'discount_type', {
      type: Sequelize.ENUM('Fixed', 'Percentage'),
      allowNull: true, // Or false with a default, depending on logic
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SaleItems', 'discount');
    await queryInterface.removeColumn('SaleItems', 'discount_type');
  }
};