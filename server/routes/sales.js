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
  // cartDiscount is the overall discount object { type, value }
  const { BookshopId, payment_method, items, cartDiscount } = req.body;
  
  if (!BookshopId || !payment_method || !items || items.length === 0) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const t = await sequelize.transaction();
  let subtotalAfterItemDiscounts = 0;

  try {
    // Create the main Sale record first. The final total will be updated later.
    const sale = await Sale.create(
      { BookshopId, payment_method, total_amount: 0, discount: 0 },
      { transaction: t }
    );

    for (const item of items) {
      const book = await Book.findByPk(item.BookId, { transaction: t });

      if (!book) throw new Error(`Book with id ${item.BookId} not found`);
      if (book.quantity < item.quantity) throw new Error(`Not enough stock for book: ${book.name}`);

      let itemPrice = parseFloat(book.price);
      let itemDiscountValue = parseFloat(item.discount) || 0;

      // Apply item-level discount
      if (item.discount_type === 'Fixed' && itemDiscountValue > 0) {
        itemPrice -= itemDiscountValue;
      } else if (item.discount_type === 'Percentage' && itemDiscountValue > 0) {
        itemPrice *= (1 - (itemDiscountValue / 100));
      }
      itemPrice = Math.max(0, itemPrice); // Ensure price doesn't go below zero

      subtotalAfterItemDiscounts += itemPrice * item.quantity;

      // Create the SaleItem with discount details
      await SaleItem.create(
        {
          SaleId: sale.id,
          BookId: item.BookId,
          quantity: item.quantity,
          price: book.price, // Store original price
          discount: itemDiscountValue,
          discount_type: item.discount_type,
        },
        { transaction: t }
      );

      // Decrement stock
      await book.decrement('quantity', { by: item.quantity, transaction: t });
    }

    // Calculate and apply the overall cart discount
    let finalCartDiscountAmount = 0;
    if (cartDiscount) {
        if (cartDiscount.type === 'Fixed') {
            finalCartDiscountAmount = parseFloat(cartDiscount.value) || 0;
        } else if (cartDiscount.type === 'Percentage') {
            finalCartDiscountAmount = subtotalAfterItemDiscounts * (parseFloat(cartDiscount.value) / 100);
        }
    }

    const finalTotalAmount = Math.max(0, subtotalAfterItemDiscounts - finalCartDiscountAmount);

    // Update the sale with the final calculated amounts
    await sale.update({ 
        total_amount: finalTotalAmount,
        discount: finalCartDiscountAmount, // Store the calculated cart discount amount
    }, { transaction: t });

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
