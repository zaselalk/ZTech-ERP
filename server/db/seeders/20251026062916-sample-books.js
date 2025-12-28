'use strict';

// Helper function to get a random element from an array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate a random number in a range
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Data for generation
const titlePrefixes = ["The Secret of", "Journey to", "Echoes of", "A Shadow in", "The Last", "Whispers on", "Chronicles of the", "Legacy of the", "City of", "Beyond the"];
const titleSuffixes = ["Starlight", "the Void", "Ember", "the River", "Dragons", "the Wind", "the Forgotten", "the Sunken", "Glass", "Time"];
const authorFirstNames = ["Anya", "Kael", "Seraphina", "Ronan", "Elara", "Jian", "Lyra", "Zane", "Isolde", "Orion"];
const authorLastNames = ["Volkov", "Thorne", "Crestwood", "Blackwood", "Silverwood", "Lin", "Vance", "Storm", "Ashworth", "Vega"];
const publishers = ["Celestial Press", "Emberlight Books", "Riverbend Publishing", "Dragonfire Press", "Windrunner House", "Archive Editions", "Solaris Media", "Deepwater Books", "Glass Quill", "Temporal Publishing"];
const genres = ["Fantasy", "Sci-Fi", "Mystery", "Thriller", "Romance", "Historical Fiction", "Horror"];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Get the actual IDs from the Bookshops table
    // const bookshops = await queryInterface.sequelize.query(
    //   `SELECT id from Bookshops;`,
    //   { type: queryInterface.sequelize.QueryTypes.SELECT }
    // );
    // const bookshopIds = bookshops.map(bs => bs.id);

    // if (bookshopIds.length === 0) {
    //   throw new Error("No bookshops found. Please seed bookshops before seeding books.");
    // }

    const books = [];
    const barcodes = new Set();

    while (books.length < 100) {
      const barcode = `978-${getRandomInt(1, 9)}-${getRandomInt(1000, 9999)}-${getRandomInt(1000, 9999)}-${getRandomInt(0, 9)}`;
      if (barcodes.has(barcode)) continue; // Ensure barcode is unique
      barcodes.add(barcode);

      const name = `${getRandom(titlePrefixes)} ${getRandom(titleSuffixes)}`;
      const author = `${getRandom(authorFirstNames)} ${getRandom(authorLastNames)}`;

      // Ensure unique name/author combo
      if (books.some(b => b.name === name && b.author === author)) continue;

      books.push({
        barcode,
        name,
        author,
        publisher: getRandom(publishers),
        genre: getRandom(genres),
        quantity: getRandomInt(5, 50),
        price: getRandomInt(800, 3500), // Realistic LKR pricing
        reorder_threshold: getRandomInt(5, 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await queryInterface.bulkInsert('Books', books, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Books', null, {});
  }
};