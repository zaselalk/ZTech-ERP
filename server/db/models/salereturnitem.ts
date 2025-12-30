import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { SaleReturnItem } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<SaleReturnItem> => {
  SaleReturnItem.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      SaleReturnId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "SaleReturns",
          key: "id",
        },
      },
      SaleItemId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "SaleItems",
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
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      cost_price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      refund_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reason: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      restockInventory: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "SaleReturnItem",
      tableName: "SaleReturnItems",
      timestamps: true,
    }
  );

  (SaleReturnItem as any).associate = (models: any) => {
    SaleReturnItem.belongsTo(models.SaleReturn, {
      foreignKey: "SaleReturnId",
      as: "saleReturn",
    });
    SaleReturnItem.belongsTo(models.SaleItem, {
      foreignKey: "SaleItemId",
      as: "saleItem",
    });
    SaleReturnItem.belongsTo(models.Product, {
      foreignKey: "ProductId",
      as: "product",
    });
  };

  return SaleReturnItem;
};
