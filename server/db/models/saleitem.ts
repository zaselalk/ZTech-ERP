import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { SaleItem } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<SaleItem> => {
  SaleItem.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      SaleId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Sales",
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
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_type: {
        type: dataTypes.ENUM("Fixed", "Percentage"),
        allowNull: false,
        defaultValue: "Fixed",
      },
      productName: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      productBrand: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      productBarcode: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      cost_price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "SaleItem",
      tableName: "SaleItems",
      timestamps: true,
    }
  );

  // Define associations
  (SaleItem as any).associate = (models: any) => {
    SaleItem.belongsTo(models.Sale, {
      foreignKey: "SaleId",
      as: "sale",
    });
    SaleItem.belongsTo(models.Product, {
      foreignKey: "ProductId",
      as: "product",
    });
  };

  return SaleItem;
};
