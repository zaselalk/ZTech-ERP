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
      {
        name: 'The Book Nook',
        location: '789 Pine Ln, Suburbia',
        contact: '555-9012',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Readers Paradise',
        location: '101 River Rd, Riverside',
        contact: '555-3456',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'The Paperback Exchange',
        location: '210 Broadway, Theater District',
        contact: '555-7890',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Gutenberg\'s',
        location: '321 Gutenberg Aly, Old Town',
        contact: '555-1122',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'The Story Keeper',
        location: '432 Tale TRL, Fairytale End',
        contact: '555-3344',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'The Scholar\'s Corner',
        location: '543 University Ave, Campus Town',
        contact: '555-5566',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'The Final Chapter',
        location: '654 Mystery Mews, Whodunnit',
        contact: '555-7788',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Once Upon a Time',
        location: '765 Storybook St, Kid\'s Quarter',
        contact: '555-9900',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Bookshops', null, {});
  }
};