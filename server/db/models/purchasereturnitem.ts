import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { PurchaseReturnItem } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<PurchaseReturnItem> => {
  PurchaseReturnItem.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      PurchaseReturnId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "PurchaseReturns",
          key: "id",
        },
      },
      PurchaseItemId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "PurchaseItems",
          key: "id",
        },
      },
      ProductId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Products",
          key: "id",
        },
      },
      productName: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      unit_cost: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      refund_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      updateInventory: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "PurchaseReturnItem",
      tableName: "PurchaseReturnItems",
      timestamps: true,
    }
  );

  (PurchaseReturnItem as any).associate = (models: any) => {
    PurchaseReturnItem.belongsTo(models.PurchaseReturn, {
      foreignKey: "PurchaseReturnId",
      as: "purchaseReturn",
    });
    PurchaseReturnItem.belongsTo(models.PurchaseItem, {
      foreignKey: "PurchaseItemId",
      as: "purchaseItem",
    });
    PurchaseReturnItem.belongsTo(models.Product, {
      foreignKey: "ProductId",
      as: "product",
    });
  };

  return PurchaseReturnItem;
};
