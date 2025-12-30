import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { PurchaseItem } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<PurchaseItem> => {
  PurchaseItem.init(
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
        defaultValue: 1,
      },
      unit_cost: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_cost: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "PurchaseItem",
      tableName: "PurchaseItems",
      timestamps: true,
    }
  );

  (PurchaseItem as any).associate = (models: any) => {
    PurchaseItem.belongsTo(models.Purchase, {
      foreignKey: "PurchaseId",
      as: "purchase",
    });
    PurchaseItem.belongsTo(models.Product, {
      foreignKey: "ProductId",
      as: "product",
    });
  };

  return PurchaseItem;
};
