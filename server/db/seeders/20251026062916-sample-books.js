'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Books', [
      {
        barcode: '978-3-16-148410-0',
        name: 'The Midnight Library',
        author: 'Matt Haig',
        publisher: 'Viking',
        genre: 'Fantasy',
        quantity: 15,
        price: 18.50,
        reorder_threshold: 5,
        BookshopId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        barcode: '978-1-40-885565-2',
        name: 'Harry Potter and the Sorcerer\'s Stone',
        author: 'J.K. Rowling',
        publisher: 'Scholastic',
        genre: 'Fantasy',
        quantity: 25,
        price: 12.99,
        reorder_threshold: 10,
        BookshopId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        barcode: '978-0-30-759400-9',
        name: 'The Martian',
        author: 'Andy Weir',
        publisher: 'Crown',
        genre: 'Sci-Fi',
        quantity: 8,
        price: 15.00,
        reorder_threshold: 3,
        BookshopId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        barcode: '978-0-74-327356-5',
        name: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publisher: 'Scribner',
        genre: 'Classic',
        quantity: 12,
        price: 10.00,
        reorder_threshold: 5,
        BookshopId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Books', null, {});
  }
};