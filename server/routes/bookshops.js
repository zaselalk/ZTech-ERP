const express = require('express');
const router = express.Router();
const { Bookshop, Sale } = require('../db/models');

// Get all bookshops
router.get('/', async (req, res) => {
  try {
    const bookshops = await Bookshop.findAll();
    res.json(bookshops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single bookshop
router.get('/:id', async (req, res) => {
  try {
    const bookshop = await Bookshop.findByPk(req.params.id);
    if (bookshop) {
      res.json(bookshop);
    } else {
      res.status(404).json({ message: 'Bookshop not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new bookshop
router.post('/', async (req, res) => {
  try {
    const bookshop = await Bookshop.create(req.body);
    res.status(201).json(bookshop);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a bookshop
router.put('/:id', async (req, res) => {
  try {
    const [updated] = await Bookshop.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBookshop = await Bookshop.findByPk(req.params.id);
      res.status(200).json(updatedBookshop);
    } else {
      res.status(404).json({ message: 'Bookshop not found' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a bookshop
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bookshop.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Bookshop not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sales for a bookshop
router.get('/:id/sales', async (req, res) => {
  try {
    const sales = await Sale.findAll({
      where: { BookshopId: req.params.id },
    });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
