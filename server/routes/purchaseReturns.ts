import express, { Request, Response } from "express";
import { Op } from "sequelize";
import {
  requireCreatePermission,
  requireEditPermission,
  requireViewPermission,
} from "../middleware/requirePermission";

const db = require("../db/models");
const {
  PurchaseReturn,
  PurchaseReturnItem,
  Purchase,
  PurchaseItem,
  Product,
  Supplier,
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

// Get all purchase returns with optional filters
router.get(
  "/",
  requireViewPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        purchaseId,
        supplierId,
        refundStatus,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = req.query;

      const where: any = {};

      if (purchaseId) {
        where.PurchaseId = purchaseId;
      }

      if (supplierId) {
        where.SupplierId = supplierId;
      }

      if (refundStatus) {
        where.refund_status = refundStatus;
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

      const { rows: returns, count: total } =
        await PurchaseReturn.findAndCountAll({
          where,
          include: [
            {
              model: Purchase,
              as: "purchase",
              attributes: [
                "id",
                "invoiceNumber",
                "total_amount",
                "purchaseDate",
              ],
            },
            {
              model: Supplier,
              as: "supplier",
              attributes: ["id", "name"],
            },
            {
              model: PurchaseReturnItem,
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

// Get a single purchase return
router.get(
  "/:id",
  requireViewPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const purchaseReturn = await PurchaseReturn.findByPk(req.params.id, {
        include: [
          {
            model: Purchase,
            as: "purchase",
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
                  },
                ],
              },
            ],
          },
          {
            model: Supplier,
            as: "supplier",
          },
          {
            model: PurchaseReturnItem,
            as: "items",
            include: [
              {
                model: Product,
                as: "product",
              },
              {
                model: PurchaseItem,
                as: "purchaseItem",
              },
            ],
          },
        ],
      });

      if (purchaseReturn) {
        res.json(purchaseReturn);
      } else {
        res.status(404).json({ message: "Purchase return not found" });
      }
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get returns for a specific purchase
router.get(
  "/purchase/:purchaseId",
  requireViewPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const returns = await PurchaseReturn.findAll({
        where: { PurchaseId: req.params.purchaseId },
        include: [
          {
            model: PurchaseReturnItem,
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

// Create a new purchase return
router.post(
  "/",
  requireCreatePermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const {
        purchaseId,
        items,
        reason,
        notes,
        returnDate,
        updateInventory = true,
      } = req.body;

      // Validate purchase exists
      const purchase = await Purchase.findByPk(purchaseId, {
        include: [
          {
            model: PurchaseItem,
            as: "items",
          },
          {
            model: Supplier,
            as: "supplier",
          },
        ],
      });

      if (!purchase) {
        await transaction.rollback();
        res.status(400).json({ message: "Purchase not found" });
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
        // Find the original purchase item
        const purchaseItem = purchase.items?.find(
          (pi: any) => pi.id === item.purchaseItemId
        );

        if (!purchaseItem) {
          await transaction.rollback();
          res.status(400).json({
            message: `Purchase item not found: ${item.purchaseItemId}`,
          });
          return;
        }

        // Calculate refund amount for this item
        const refund_amount =
          item.quantity * parseFloat(purchaseItem.unit_cost);
        total_amount += refund_amount;

        const shouldUpdateInventory =
          item.updateInventory !== undefined
            ? item.updateInventory
            : updateInventory;

        returnItems.push({
          PurchaseItemId: item.purchaseItemId,
          ProductId: purchaseItem.ProductId,
          productName: purchaseItem.productName,
          quantity: item.quantity,
          unit_cost: purchaseItem.unit_cost,
          refund_amount,
          reason: item.reason || reason,
          updateInventory: shouldUpdateInventory,
        });

        // Update inventory if needed (decrease stock since we're returning to supplier)
        if (shouldUpdateInventory && purchaseItem.ProductId) {
          await Product.decrement("quantity", {
            by: item.quantity,
            where: { id: purchaseItem.ProductId },
            transaction,
          });
        }
      }

      // Create the purchase return
      const purchaseReturn = await PurchaseReturn.create(
        {
          PurchaseId: purchaseId,
          SupplierId: purchase.SupplierId,
          total_amount,
          refund_status: "Pending",
          refund_received: 0,
          reason,
          notes,
          returnDate: returnDate ? new Date(returnDate) : new Date(),
        },
        { transaction }
      );

      // Create return items
      for (const item of returnItems) {
        await PurchaseReturnItem.create(
          {
            PurchaseReturnId: purchaseReturn.id,
            ...item,
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Fetch the complete return with associations
      const completeReturn = await PurchaseReturn.findByPk(purchaseReturn.id, {
        include: [
          {
            model: Purchase,
            as: "purchase",
          },
          {
            model: Supplier,
            as: "supplier",
          },
          {
            model: PurchaseReturnItem,
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

// Update a purchase return (add refund received)
router.put(
  "/:id",
  requireEditPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    const transaction = await sequelize.transaction();

    try {
      const purchaseReturn = await PurchaseReturn.findByPk(req.params.id);

      if (!purchaseReturn) {
        await transaction.rollback();
        res.status(404).json({ message: "Purchase return not found" });
        return;
      }

      const { refund_received, reason, notes } = req.body;

      const updateData: any = {};

      if (reason !== undefined) {
        updateData.reason = reason;
      }

      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (refund_received !== undefined) {
        const newRefundReceived =
          parseFloat(purchaseReturn.refund_received) +
          parseFloat(refund_received);
        updateData.refund_received = newRefundReceived;

        // Update refund status
        if (newRefundReceived >= parseFloat(purchaseReturn.total_amount)) {
          updateData.refund_status = "Completed";
        } else if (newRefundReceived > 0) {
          updateData.refund_status = "Partial";
        }
      }

      await purchaseReturn.update(updateData, { transaction });

      await transaction.commit();

      res.json(purchaseReturn);
    } catch (err) {
      await transaction.rollback();
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

// Get purchase return summary
router.get(
  "/summary/stats",
  requireViewPermission("suppliers"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

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

      const totalReturns = await PurchaseReturn.count({ where });
      const totalAmount = await PurchaseReturn.sum("total_amount", { where });
      const totalRefundReceived = await PurchaseReturn.sum("refund_received", {
        where,
      });

      // Get returns by status
      const byStatus = await PurchaseReturn.findAll({
        where,
        attributes: [
          "refund_status",
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
          [sequelize.fn("SUM", sequelize.col("total_amount")), "total"],
        ],
        group: ["refund_status"],
      });

      res.json({
        totalReturns,
        totalAmount: totalAmount || 0,
        totalRefundReceived: totalRefundReceived || 0,
        pendingRefund: (totalAmount || 0) - (totalRefundReceived || 0),
        byStatus,
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
