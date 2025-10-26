const express = require('express');
const router = express.Router();
const { Sale, Book, sequelize } = require('../db/models');
const { Op } = require('sequelize');

// Get sales report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    const sales = await Sale.findAll({ where, include: ['bookshop'] });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get low stock report
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockBooks = await Book.findAll({
      where: {
        quantity: {
          [Op.lte]: sequelize.col('reorder_threshold'),
        },
      },
      include: ['bookshop'],
    });
    res.json(lowStockBooks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
