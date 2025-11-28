import express, { Request, Response } from "express";
import { Op } from "sequelize";
const db = require("../db/models");
const { Book, SaleItem, Sale, Bookshop } = db;

const router = express.Router();

interface BooksQueryParams {
  search?: string;
  type?: "name" | "barcode";
}

// Get all books
router.get(
  "/",
  async (
    req: Request<{}, {}, {}, BooksQueryParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { search, type } = req.query;
      let where = {};
      if (search) {
        if (type === "barcode") {
          where = { barcode: { [Op.like]: `%${search}%` } };
        } else {
          where = {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { author: { [Op.like]: `%${search}%` } },
            ],
          };
        }
      }
      const books = await Book.findAll({ where });
      res.json(books);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get top seller books
router.get(
  "/top-sellers",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const books = await Book.findAll({ limit: 12 });
      res.json(books);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get low stock books
router.get("/low-stock", async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await Book.findAll({
      where: {
        quantity: {
          [Op.lte]: db.sequelize.col("reorder_threshold"),
        },
      },
    });
    res.json(books);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single book
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get stats for a single book
router.get("/:id/stats", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id;

    // Calculate total sales
    const totalSales = await SaleItem.sum("quantity", {
      where: { BookId: bookId },
    });

    // Calculate top bookshops
    const topBookshopsData = await SaleItem.findAll({
      where: { BookId: bookId },
      attributes: [
        [
          db.sequelize.fn("SUM", db.sequelize.col("SaleItem.quantity")),
          "total_quantity",
        ],
        [db.sequelize.fn("MAX", db.sequelize.col("sale.createdAt")), "date"],
      ],
      include: [
        {
          model: Sale,
          as: "sale",
          attributes: [],
          include: [
            {
              model: Bookshop,
              as: "bookshop",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      group: ["sale.BookshopId", "sale->bookshop.id", "sale->bookshop.name"],
      order: [[db.sequelize.literal("total_quantity"), "DESC"]],
      raw: true,
      nest: true,
    });

    const topBookshops = topBookshopsData.map((item: any) => ({
      bookshop: item.sale.bookshop,
      total_quantity: item.total_quantity,
      date: item.date,
    }));

    res.json({
      totalSales: totalSales || 0,
      topBookshops: topBookshops,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new book
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
});

// Update a book
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const [updated] = await Book.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedBook = await Book.findByPk(req.params.id);
      res.status(200).json(updatedBook);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(400).json({ message: error.message });
  }
});

// Delete a book
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Book.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get sales for a single book
router.get("/:id/sales", async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id;
    const sales = await Sale.findAll({
      include: [
        {
          model: Book,
          as: "books",
          where: { id: bookId },
          through: {
            attributes: ["quantity", "price", "discount"],
          },
        },
        {
          model: Bookshop,
          as: "bookshop",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

export = router;
