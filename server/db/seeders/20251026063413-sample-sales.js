'use strict';

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Reset tables to ensure predictable IDs
    await queryInterface.bulkDelete('SaleItems', null, {});
    await queryInterface.bulkDelete('Sales', null, {});
    await queryInterface.sequelize.query('ALTER TABLE Sales AUTO_INCREMENT = 1;');
    await queryInterface.sequelize.query('ALTER TABLE SaleItems AUTO_INCREMENT = 1;');

    const customers = await queryInterface.sequelize.query(`SELECT id from Customers;`, { type: queryInterface.sequelize.QueryTypes.SELECT });
    const books = await queryInterface.sequelize.query(`SELECT id, price from Books;`, { type: queryInterface.sequelize.QueryTypes.SELECT });

    if (customers.length === 0 || books.length < 3) {
      console.log("Not enough customers or books to create sample sales.");
      return;
    }

    const sales = [];
    const saleItems = [];
    const bookUpdates = {};

    for (let i = 0; i < 50; i++) {
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 90)); // Random date in the last 90 days

      const customer = getRandom(customers);
      const numItems = Math.floor(Math.random() * 3) + 1;
      const saleBooks = [];
      for (let j = 0; j < numItems; j++) {
        saleBooks.push(getRandom(books));
      }

      const total_amount = saleBooks.reduce((acc, book) => acc + parseFloat(book.price), 0);
      const saleId = i + 1;

      sales.push({
        id: saleId,
        CustomerId: customer.id,
        payment_method: getRandom(['Cash', 'Card', 'Consignment']),
        total_amount,
        discount: 0,
        createdAt: saleDate,
        updatedAt: saleDate,
      });

      for (const book of saleBooks) {
        saleItems.push({
          SaleId: saleId,
          BookId: book.id,
          quantity: 1,
          price: book.price,
          createdAt: saleDate,
          updatedAt: saleDate,
        });

        if (!bookUpdates[book.id]) {
          bookUpdates[book.id] = 0;
        }
        bookUpdates[book.id]++;
      }
    }

    const t = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('Sales', sales, { transaction: t });
      await queryInterface.bulkInsert('SaleItems', saleItems, { transaction: t });

      for (const bookId in bookUpdates) {
        await queryInterface.bulkUpdate('Books', { quantity: Sequelize.literal(`quantity - ${bookUpdates[bookId]}`) }, { id: bookId }, { transaction: t });
      }

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