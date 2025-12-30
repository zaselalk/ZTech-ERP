import express, { Request, Response } from "express";
import { Op } from "sequelize";
import {
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";

const db = require("../db/models");
const {
  Purchase,
  PurchaseItem,
  Supplier,
  Product,
  SupplierPayment,
  Settings,
  sequelize,
} = db;

const router = express.Router();

// Middleware to check if supplier management is enabled
const checkSupplierEnabled = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.enableSupplierManagement) {
      res.status(403).json({
        message: "Supplier management is not enabled",
      });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking supplier settings" });
  }
};

// Apply middleware to all routes
router.use(checkSupplierEnabled);

// Get all purchases with optional filters
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      supplierId,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const where: any = {};

    if (supplierId) {
      where.SupplierId = supplierId;
    }

    if (paymentStatus) {
      where.payment_status = paymentStatus;
    }

    if (startDate || endDate) {
      where.purchaseDate = {};
      if (startDate) {
        where.purchaseDate[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.purchaseDate[Op.lte] = new Date(endDate as string);
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows: purchases, count: total } = await Purchase.findAndCountAll({
      where,
      include: [
        {
          model: Supplier,
          as: "supplier",
          attributes: ["id", "name"],
        },
        {
          model: PurchaseItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "barcode"],
            },
          ],
        },
      ],
      order: [["purchaseDate", "DESC"]],
      limit: Number(limit),
      offset,
    });

    res.json({
      data: purchases,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Get a single purchase
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const purchase = await Purchase.findByPk(req.params.id, {
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
        {
          model: PurchaseItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "barcode", "price", "quantity"],
            },
          ],
        },
        {
          model: SupplierPayment,
          as: "payments",
          order: [["paymentDate", "DESC"]],
        },
      ],
    });

    if (purchase) {
      res.json(purchase);
    } else {
      res.status(404).json({ message: "Purchase not found" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ message: error.message });
  }
});

// Create a new purchase
router.post(
  "/",
  requireCreatePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const {
        supplierId,
        invoiceNumber,
        items,
        notes,
        purchaseDate,
        initialPayment,
        paymentMethod,
        updateInventory = true,
      } = req.body;

      // Validate supplier exists
      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        await transaction.rollback();
        res.status(400).json({ message: "Supplier not found" });
        return;
      }

      // Validate items
      if (!items || items.length === 0) {
        await transaction.rollback();
        res.status(400).json({ message: "At least one item is required" });
        return;
      }

      // Calculate total amount
      let total_amount = 0;
      for (const item of items) {
        total_amount += item.quantity * item.unit_cost;
      }

      // Determine payment status
      const paid_amount = initialPayment || 0;
      let payment_status: "Unpaid" | "Partial" | "Paid" = "Unpaid";
      if (paid_amount >= total_amount) {
        payment_status = "Paid";
      } else if (paid_amount > 0) {
        payment_status = "Partial";
      }

      // Create purchase
      const purchase = await Purchase.create(
        {
          SupplierId: supplierId,
          invoiceNumber: invoiceNumber?.trim() || null,
          total_amount,
          paid_amount,
          payment_status,
          notes: notes?.trim() || null,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        },
        { transaction }
      );

      // Create purchase items and optionally update inventory
      for (const item of items) {
        let productName = item.productName;

        // If ProductId is provided, get product name and optionally update inventory
        if (item.productId) {
          const product = await Product.findByPk(item.productId);
          if (product) {
            productName = product.name;

            // Update inventory if enabled
            if (updateInventory) {
              await product.update(
                {
                  quantity: product.quantity + item.quantity,
                  cost_price: item.unit_cost, // Update cost price to latest purchase price
                },
                { transaction }
              );
            }
          }
        }

        await PurchaseItem.create(
          {
            PurchaseId: purchase.id,
            ProductId: item.productId || null,
            productName,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.quantity * item.unit_cost,
          },
          { transaction }
        );
      }

      // Create initial payment if provided
      if (initialPayment && initialPayment > 0) {
        await SupplierPayment.create(
          {
            SupplierId: supplierId,
            PurchaseId: purchase.id,
            amount: initialPayment,
            payment_method: paymentMethod || "Cash",
            notes: "Initial payment with purchase",
            paymentDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Fetch the complete purchase with associations
      const completePurchase = await Purchase.findByPk(purchase.id, {
        include: [
          { model: Supplier, as: "supplier" },
          {
            model: PurchaseItem,
            as: "items",
            include: [{ model: Product, as: "product" }],
          },
        ],
      });

      res.status(201).json(completePurchase);
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Update a purchase
router.put(
  "/:id",
  requireEditPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { invoiceNumber, notes, purchaseDate } = req.body;

      const purchase = await Purchase.findByPk(req.params.id);
      if (!purchase) {
        res.status(404).json({ message: "Purchase not found" });
        return;
      }

      await purchase.update({
        invoiceNumber: invoiceNumber?.trim() || purchase.invoiceNumber,
        notes: notes?.trim() || purchase.notes,
        purchaseDate: purchaseDate
          ? new Date(purchaseDate)
          : purchase.purchaseDate,
      });

      const updatedPurchase = await Purchase.findByPk(req.params.id, {
        include: [
          { model: Supplier, as: "supplier" },
          { model: PurchaseItem, as: "items" },
        ],
      });

      res.json(updatedPurchase);
    } catch (err) {
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Delete a purchase
router.delete(
  "/:id",
  requireDeletePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const purchase = await Purchase.findByPk(req.params.id, {
        include: [{ model: PurchaseItem, as: "items" }],
      });

      if (!purchase) {
        await transaction.rollback();
        res.status(404).json({ message: "Purchase not found" });
        return;
      }

      // Check if there are payments
      const paymentsCount = await SupplierPayment.count({
        where: { PurchaseId: purchase.id },
      });

      if (paymentsCount > 0) {
        await transaction.rollback();
        res.status(400).json({
          message:
            "Cannot delete purchase with payments. Remove payments first.",
        });
        return;
      }

      // Delete purchase items (cascade should handle this, but being explicit)
      await PurchaseItem.destroy({
        where: { PurchaseId: purchase.id },
        transaction,
      });

      // Delete purchase
      await purchase.destroy({ transaction });

      await transaction.commit();
      res.status(204).send();
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get purchases for a specific supplier
router.get(
  "/supplier/:supplierId",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const purchases = await Purchase.findAll({
        where: { SupplierId: req.params.supplierId },
        include: [
          {
            model: PurchaseItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
                attributes: ["id", "name", "barcode"],
              },
            ],
          },
        ],
        order: [["purchaseDate", "DESC"]],
      });

      res.json(purchases);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get supplier balance (total unpaid amount)
router.get(
  "/supplier/:supplierId/balance",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const supplier = await Supplier.findByPk(req.params.supplierId);
      if (!supplier) {
        res.status(404).json({ message: "Supplier not found" });
        return;
      }

      const purchases = await Purchase.findAll({
        where: {
          SupplierId: req.params.supplierId,
          payment_status: { [Op.in]: ["Unpaid", "Partial"] },
        },
        attributes: ["id", "total_amount", "paid_amount", "payment_status"],
      });

      const totalOwed = purchases.reduce(
        (sum: number, p: any) =>
          sum + (parseFloat(p.total_amount) - parseFloat(p.paid_amount)),
        0
      );

      const totalPurchases = await Purchase.sum("total_amount", {
        where: { SupplierId: req.params.supplierId },
      });

      const totalPaid = await SupplierPayment.sum("amount", {
        where: { SupplierId: req.params.supplierId },
      });

      res.json({
        supplierId: supplier.id,
        supplierName: supplier.name,
        totalOwed,
        totalPurchases: totalPurchases || 0,
        totalPaid: totalPaid || 0,
        unpaidPurchases: purchases,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Add payment to a purchase
router.post(
  "/:id/payments",
  requireCreatePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const { amount, paymentMethod, reference, notes, paymentDate } = req.body;

      const purchase = await Purchase.findByPk(req.params.id);
      if (!purchase) {
        await transaction.rollback();
        res.status(404).json({ message: "Purchase not found" });
        return;
      }

      if (!amount || amount <= 0) {
        await transaction.rollback();
        res.status(400).json({ message: "Valid payment amount is required" });
        return;
      }

      const remainingAmount =
        parseFloat(purchase.total_amount) - parseFloat(purchase.paid_amount);

      if (amount > remainingAmount) {
        await transaction.rollback();
        res.status(400).json({
          message: `Payment amount exceeds remaining balance of ${remainingAmount}`,
        });
        return;
      }

      // Create payment record
      const payment = await SupplierPayment.create(
        {
          SupplierId: purchase.SupplierId,
          PurchaseId: purchase.id,
          amount,
          payment_method: paymentMethod || "Cash",
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
        { transaction }
      );

      // Update purchase paid amount and status
      const newPaidAmount = parseFloat(purchase.paid_amount) + amount;
      let newStatus: "Unpaid" | "Partial" | "Paid" = "Partial";
      if (newPaidAmount >= parseFloat(purchase.total_amount)) {
        newStatus = "Paid";
      }

      await purchase.update(
        {
          paid_amount: newPaidAmount,
          payment_status: newStatus,
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        payment,
        purchase: {
          id: purchase.id,
          paid_amount: newPaidAmount,
          payment_status: newStatus,
          remaining: parseFloat(purchase.total_amount) - newPaidAmount,
        },
      });
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

// Get all payments for a supplier
router.get(
  "/supplier/:supplierId/payments",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const payments = await SupplierPayment.findAll({
        where: { SupplierId: req.params.supplierId },
        include: [
          {
            model: Purchase,
            as: "purchase",
            attributes: ["id", "invoiceNumber", "total_amount"],
          },
        ],
        order: [["paymentDate", "DESC"]],
      });

      res.json(payments);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Make a general payment to supplier (not tied to specific purchase)
router.post(
  "/supplier/:supplierId/payments",
  requireCreatePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const {
        amount,
        paymentMethod,
        reference,
        notes,
        paymentDate,
        purchaseIds,
      } = req.body;

      const supplier = await Supplier.findByPk(req.params.supplierId);
      if (!supplier) {
        await transaction.rollback();
        res.status(404).json({ message: "Supplier not found" });
        return;
      }

      if (!amount || amount <= 0) {
        await transaction.rollback();
        res.status(400).json({ message: "Valid payment amount is required" });
        return;
      }

      let remainingPayment = amount;
      const updatedPurchases: any[] = [];

      // If specific purchase IDs are provided, apply payment to those
      if (purchaseIds && purchaseIds.length > 0) {
        for (const purchaseId of purchaseIds) {
          if (remainingPayment <= 0) break;

          const purchase = await Purchase.findByPk(purchaseId);
          if (
            purchase &&
            purchase.SupplierId === parseInt(req.params.supplierId)
          ) {
            const remaining =
              parseFloat(purchase.total_amount) -
              parseFloat(purchase.paid_amount);
            const paymentForThis = Math.min(remainingPayment, remaining);

            if (paymentForThis > 0) {
              const newPaidAmount =
                parseFloat(purchase.paid_amount) + paymentForThis;
              let newStatus: "Unpaid" | "Partial" | "Paid" = "Partial";
              if (newPaidAmount >= parseFloat(purchase.total_amount)) {
                newStatus = "Paid";
              }

              await purchase.update(
                { paid_amount: newPaidAmount, payment_status: newStatus },
                { transaction }
              );

              updatedPurchases.push({
                id: purchase.id,
                amountApplied: paymentForThis,
                newStatus,
              });

              remainingPayment -= paymentForThis;
            }
          }
        }
      } else {
        // Apply to oldest unpaid purchases first (FIFO)
        const unpaidPurchases = await Purchase.findAll({
          where: {
            SupplierId: req.params.supplierId,
            payment_status: { [Op.in]: ["Unpaid", "Partial"] },
          },
          order: [["purchaseDate", "ASC"]],
        });

        for (const purchase of unpaidPurchases) {
          if (remainingPayment <= 0) break;

          const remaining =
            parseFloat(purchase.total_amount) -
            parseFloat(purchase.paid_amount);
          const paymentForThis = Math.min(remainingPayment, remaining);

          if (paymentForThis > 0) {
            const newPaidAmount =
              parseFloat(purchase.paid_amount) + paymentForThis;
            let newStatus: "Unpaid" | "Partial" | "Paid" = "Partial";
            if (newPaidAmount >= parseFloat(purchase.total_amount)) {
              newStatus = "Paid";
            }

            await purchase.update(
              { paid_amount: newPaidAmount, payment_status: newStatus },
              { transaction }
            );

            updatedPurchases.push({
              id: purchase.id,
              amountApplied: paymentForThis,
              newStatus,
            });

            remainingPayment -= paymentForThis;
          }
        }
      }

      // Create payment record
      const payment = await SupplierPayment.create(
        {
          SupplierId: parseInt(req.params.supplierId),
          PurchaseId: null, // General payment
          amount,
          payment_method: paymentMethod || "Cash",
          reference: reference?.trim() || null,
          notes: notes?.trim() || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      res.status(201).json({
        payment,
        appliedTo: updatedPurchases,
        unappliedAmount: remainingPayment,
      });
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
