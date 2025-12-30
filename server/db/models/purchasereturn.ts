import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { PurchaseReturn } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<PurchaseReturn> => {
  PurchaseReturn.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      PurchaseId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Purchases",
          key: "id",
        },
      },
      SupplierId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "id",
        },
      },
      total_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      refund_status: {
        type: dataTypes.ENUM("Pending", "Partial", "Completed"),
        allowNull: false,
        defaultValue: "Pending",
      },
      refund_received: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      reason: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      returnDate: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "PurchaseReturn",
      tableName: "PurchaseReturns",
      timestamps: true,
    }
  );

  (PurchaseReturn as any).associate = (models: any) => {
    PurchaseReturn.belongsTo(models.Purchase, {
      foreignKey: "PurchaseId",
      as: "purchase",
    });
    PurchaseReturn.belongsTo(models.Supplier, {
      foreignKey: "SupplierId",
      as: "supplier",
    });
    PurchaseReturn.hasMany(models.PurchaseReturnItem, {
      foreignKey: "PurchaseReturnId",
      as: "items",
    });
  };

  return PurchaseReturn;
};
