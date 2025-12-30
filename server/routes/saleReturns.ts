import express, { Request, Response } from "express";
import { Op } from "sequelize";
import {
  requireCreatePermission,
  requireEditPermission,
  requireViewPermission,
} from "../middleware/requirePermission";

const db = require("../db/models");
const {
  SaleReturn,
  SaleReturnItem,
  Sale,
  SaleItem,
  Product,
  Customer,
  sequelize,
} = db;

const router = express.Router();

// Get all sale returns with optional filters
router.get(
  "/",
  requireViewPermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        saleId,
        customerId,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const where: any = {};

      if (saleId) {
        where.SaleId = saleId;
      }

      if (customerId) {
        where.CustomerId = customerId;
      }

      if (startDate || endDate) {
        where.returnDate = {};
        if (startDate) {
          where.returnDate[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          where.returnDate[Op.lte] = end;
        }
      }

      const offset = (Number(page) - 1) * Number(limit);

      const { rows: returns, count: total } = await SaleReturn.findAndCountAll({
        where,
        include: [
          {
            model: Sale,
            as: "sale",
            attributes: ["id", "total_amount", "payment_method", "createdAt"],
          },
          {
            model: Customer,
            as: "customer",
            attributes: ["id", "name"],
          },
          {
            model: SaleReturnItem,
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
        order: [["returnDate", "DESC"]],
        limit: Number(limit),
        offset,
      });

      res.json({
        data: returns,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get a single sale return
router.get(
  "/:id",
  requireViewPermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const saleReturn = await SaleReturn.findByPk(req.params.id, {
        include: [
          {
            model: Sale,
            as: "sale",
            include: [
              {
                model: Customer,
                as: "customer",
              },
              {
                model: SaleItem,
                as: "items",
                include: [
                  {
                    model: Product,
                    as: "product",
                  },
                ],
              },
            ],
          },
          {
            model: Customer,
            as: "customer",
          },
          {
            model: SaleReturnItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
              {
                model: SaleItem,
                as: "saleItem",
              },
            ],
          },
        ],
      });

      if (saleReturn) {
        res.json(saleReturn);
      } else {
        res.status(404).json({ message: "Sale return not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get returns for a specific sale
router.get(
  "/sale/:saleId",
  requireViewPermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const returns = await SaleReturn.findAll({
        where: { SaleId: req.params.saleId },
        include: [
          {
            model: SaleReturnItem,
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
        order: [["returnDate", "DESC"]],
      });

      res.json(returns);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Create a new sale return
router.post(
  "/",
  requireCreatePermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const {
        saleId,
        items,
        refund_method = "Cash",
        reason,
        notes,
        returnDate,
      } = req.body;

      // Validate sale exists
      const sale = await Sale.findByPk(saleId, {
        include: [
          {
            model: SaleItem,
            as: "items",
          },
        ],
      });

      if (!sale) {
        await transaction.rollback();
        res.status(400).json({ message: "Sale not found" });
        return;
      }

      // Validate items
      if (!items || items.length === 0) {
        await transaction.rollback();
        res.status(400).json({ message: "At least one item is required" });
        return;
      }

      // Calculate total refund amount
      let total_amount = 0;
      const returnItems: any[] = [];

      for (const item of items) {
        // Find the original sale item
        const saleItem = sale.items?.find(
          (si: any) => si.id === item.saleItemId
        );

        if (!saleItem) {
          await transaction.rollback();
          res.status(400).json({
            message: `Sale item not found: ${item.saleItemId}`,
          });
          return;
        }

        // Calculate refund amount for this item
        const refund_amount = item.quantity * parseFloat(saleItem.price);
        total_amount += refund_amount;

        returnItems.push({
          SaleItemId: item.saleItemId,
          ProductId: saleItem.ProductId,
          productName: saleItem.productName,
          quantity: item.quantity,
          price: saleItem.price,
          cost_price: saleItem.cost_price,
          refund_amount,
          reason: item.reason || reason,
          restockInventory: item.restockInventory !== false,
        });

        // Update inventory if restocking
        if (item.restockInventory !== false && saleItem.ProductId) {
          await Product.increment("quantity", {
            by: item.quantity,
            where: { id: saleItem.ProductId },
            transaction,
          });
        }
      }

      // If refund method is Credit, add to customer's credit balance
      if (refund_method === "Credit" && sale.CustomerId) {
        await Customer.decrement("credit_balance", {
          by: total_amount,
          where: { id: sale.CustomerId },
          transaction,
        });
      }

      // Create the sale return
      const saleReturn = await SaleReturn.create(
        {
          SaleId: saleId,
          CustomerId: sale.CustomerId,
          total_amount,
          refund_method,
          reason,
          notes,
          returnDate: returnDate ? new Date(returnDate) : new Date(),
        },
        { transaction }
      );

      // Create return items
      for (const item of returnItems) {
        await SaleReturnItem.create(
          {
            SaleReturnId: saleReturn.id,
            ...item,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Fetch the complete return with associations
      const completeReturn = await SaleReturn.findByPk(saleReturn.id, {
        include: [
          {
            model: Sale,
            as: "sale",
          },
          {
            model: Customer,
            as: "customer",
          },
          {
            model: SaleReturnItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
      });

      res.status(201).json(completeReturn);
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Update a sale return
router.put(
  "/:id",
  requireEditPermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const saleReturn = await SaleReturn.findByPk(req.params.id);

      if (!saleReturn) {
        res.status(404).json({ message: "Sale return not found" });
        return;
      }

      const { reason, notes } = req.body;

      await saleReturn.update({
        reason,
        notes,
      });

      res.json(saleReturn);
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get sale return summary
router.get(
  "/summary/stats",
  requireViewPermission("sales"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, customerId } = req.query;

      const where: any = {};

      if (startDate || endDate) {
        where.returnDate = {};
        if (startDate) {
          where.returnDate[Op.gte] = new Date(startDate as string);
        }
        if (endDate) {
          const end = new Date(endDate as string);
          end.setHours(23, 59, 59, 999);
          where.returnDate[Op.lte] = end;
        }
      }

      if (customerId) {
        where.CustomerId = Number(customerId);
      }

      const totalReturns = await SaleReturn.count({ where });
      const totalRefunded = await SaleReturn.sum("total_amount", { where });

      // Get returns by refund method
      const byRefundMethod = await SaleReturn.findAll({
        where,
        attributes: [
          "refund_method",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
        ],
        group: ["refund_method"],
      });

      res.json({
        totalReturns,
        totalRefunded: totalRefunded || 0,
        byRefundMethod,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
