const express = require('express');
const router = express.Router();
const { sequelize, Sale, SaleItem, Book, Bookshop } = require('../db/models');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: ['bookshop', { model: Book, as: 'books' }],
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single sale
router.get('/:id', async (req, res) => {
  try {
    const sale = await Sale.findByPk(req.params.id, {
      include: ['bookshop', { model: Book, as: 'books' }],
    });
    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new sale
router.post('/', async (req, res) => {
  const { BookshopId, payment_method, items } = req.body; // items = [{ BookId, quantity }]
  let total_amount = 0;

  if (!BookshopId || !payment_method || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const t = await sequelize.transaction();

  try {
    const sale = await Sale.create(
      { BookshopId, payment_method, total_amount: 0 },
      { transaction: t }
    );

    for (const item of items) {
      const book = await Book.findByPk(item.BookId, { transaction: t });

      if (!book) {
        throw new Error(`Book with id ${item.BookId} not found`);
      }
      if (book.quantity < item.quantity) {
        throw new Error(`Not enough stock for book: ${book.name}`);
      }

      await SaleItem.create(
        {
          SaleId: sale.id,
          BookId: item.BookId,
          quantity: item.quantity,
          price: book.price, // Use current book price
        },
        { transaction: t }
      );

      total_amount += book.price * item.quantity;

      await book.update(
        { quantity: book.quantity - item.quantity },
        { transaction: t }
      );
    }

    await sale.update({ total_amount }, { transaction: t });

    await t.commit();

    const finalSale = await Sale.findByPk(sale.id, {
        include: ['bookshop', { model: Book, as: 'books' }]
    });

    res.status(201).json(finalSale);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
