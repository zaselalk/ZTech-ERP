'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clear existing sales data to ensure predictable IDs
    await queryInterface.bulkDelete('SaleItems', null, {});
    await queryInterface.bulkDelete('Sales', null, {});

    const t = await queryInterface.sequelize.transaction();
    try {
      // Sale 1
      await queryInterface.bulkInsert('Sales', [{
        id: 1, // Manually set ID
        BookshopId: 1,
        payment_method: 'Card',
        total_amount: 31.49, // 18.50 + 12.99
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { transaction: t });

      // Sale 2
      await queryInterface.bulkInsert('Sales', [{
        id: 2, // Manually set ID
        BookshopId: 2,
        payment_method: 'Cash',
        total_amount: 30.00, // 15.00 * 2
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { transaction: t });

      // Sale Items
      await queryInterface.bulkInsert('SaleItems', [
        { SaleId: 1, BookId: 1, quantity: 1, price: 18.50, createdAt: new Date(), updatedAt: new Date() },
        { SaleId: 1, BookId: 2, quantity: 1, price: 12.99, createdAt: new Date(), updatedAt: new Date() },
        { SaleId: 2, BookId: 3, quantity: 2, price: 15.00, createdAt: new Date(), updatedAt: new Date() },
      ], { transaction: t });

      // Update book quantities
      await queryInterface.bulkUpdate('Books', { quantity: Sequelize.literal('quantity - 1') }, { id: [1, 2] }, { transaction: t });
      await queryInterface.bulkUpdate('Books', { quantity: Sequelize.literal('quantity - 2') }, { id: 3 }, { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error(error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SaleItems', null, {});
    await queryInterface.bulkDelete('Sales', null, {});
  }
};