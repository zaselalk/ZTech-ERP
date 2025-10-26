'use strict';

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Reset tables to ensure predictable IDs
    await queryInterface.bulkDelete('SaleItems', null, {});
    await queryInterface.bulkDelete('Sales', null, {});
    await queryInterface.sequelize.query('ALTER TABLE Sales AUTO_INCREMENT = 1;');
    await queryInterface.sequelize.query('ALTER TABLE SaleItems AUTO_INCREMENT = 1;');

    const bookshops = await queryInterface.sequelize.query(`SELECT id from Bookshops;`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const books = await queryInterface.sequelize.query(`SELECT id, price from Books LIMIT 10;`, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (bookshops.length === 0 || books.length < 3) {
      console.log("Not enough bookshops or books to create sample sales.");
      return;
    }

    const t = await queryInterface.sequelize.transaction();
    try {
      // --- Create Sale 1 ---
      const sale1Items = [books[0], books[1]];
      const sale1Subtotal = sale1Items.reduce((acc, item) => acc + parseFloat(item.price), 0);
      const sale1CartDiscount = Math.round(sale1Subtotal * 0.1); // 10% discount
      const sale1Total = sale1Subtotal - sale1CartDiscount;

      await queryInterface.bulkInsert('Sales', [{
        id: 1,
        BookshopId: getRandom(bookshops).id,
        payment_method: 'Card',
        total_amount: sale1Total,
        discount: sale1CartDiscount,
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { transaction: t });

      const sale1ItemData = sale1Items.map(item => ({
        SaleId: 1, // Assumes Sale ID is 1
        BookId: item.id,
        quantity: 1,
        price: item.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await queryInterface.bulkInsert('SaleItems', sale1ItemData, { transaction: t });
      for (const item of sale1Items) {
        await queryInterface.bulkUpdate('Books', { quantity: Sequelize.literal('quantity - 1') }, { id: item.id }, { transaction: t });
      }

      // --- Create Sale 2 ---
      const sale2Item = books[2];
      const sale2Subtotal = parseFloat(sale2Item.price) * 2;
      const sale2Total = sale2Subtotal;

      await queryInterface.bulkInsert('Sales', [{
        id: 2,
        BookshopId: getRandom(bookshops).id,
        payment_method: 'Cash',
        total_amount: sale2Total,
        discount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { transaction: t });

      await queryInterface.bulkInsert('SaleItems', [{
        SaleId: 2, // Assumes Sale ID is 2
        BookId: sale2Item.id,
        quantity: 2,
        price: sale2Item.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      }], { transaction: t });
      await queryInterface.bulkUpdate('Books', { quantity: Sequelize.literal('quantity - 2') }, { id: sale2Item.id }, { transaction: t });

      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error("Failed to seed sales:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('SaleItems', null, {});
    await queryInterface.bulkDelete('Sales', null, {});
  }
};