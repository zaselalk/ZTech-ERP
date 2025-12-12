'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Books', 'discount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Books', 'discount_type', {
      type: Sequelize.ENUM('Fixed', 'Percentage'),
      allowNull: false,
      defaultValue: 'Fixed'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Books', 'discount');
    await queryInterface.removeColumn('Books', 'discount_type');
  }
};
