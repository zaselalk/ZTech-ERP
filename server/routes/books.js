const express = require('express');
const router = express.Router();
const { Book, SaleItem, Sale, Bookshop } = require('../db/models');
const { Sequelize } = require('sequelize');

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let where = {};
    if (search) {
      where = {
        [Sequelize.Op.or]: [
          { name: { [Sequelize.Op.like]: `%${search}%` } },
          { author: { [Sequelize.Op.like]: `%${search}%` } },
        ],
      };
    }
    const books = await Book.findAll({ where });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get top seller books
router.get('/top-sellers', async (req, res) => {
  try {
    const books = await Book.findAll({ limit: 12 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock books
router.get('/low-stock', async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        quantity: {
          [Sequelize.Op.lte]: Sequelize.col('reorder_threshold'),
        },
      },
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats for a single book
router.get('/:id/stats', async (req, res) => {
  try {
    const bookId = req.params.id;

    // Calculate total sales
    const totalSales = await SaleItem.sum('quantity', {
      where: { BookId: bookId },
    });

    // Find top bookshops
    const topBookshops = await Sale.findAll({
      attributes: [
        'BookshopId',
        [Sequelize.fn('SUM', Sequelize.col('books.SaleItem.quantity')), 'total_quantity'],
      ],
      include: [
        {
          model: Book,
          as: 'books',
          where: { id: bookId },
          attributes: [],
        },
        {
          model: Bookshop,
          as: 'bookshop',
          attributes: ['id', 'name'],
          required: true,
        },
      ],
      group: ['BookshopId', 'bookshop.id', 'bookshop.name'],
      order: [[Sequelize.literal('total_quantity'), 'DESC']],
      limit: 5,
    });

    res.json({
      totalSales: totalSales || 0,
      topBookshops,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new book
router.post('/', async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a book
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Book.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBook = await Book.findByPk(req.params.id);
      res.status(200).json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Book.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
