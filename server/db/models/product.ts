import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Product } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Product> => {
  Product.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      barcode: {
        type: dataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      brand: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      supplier: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      reorder_threshold: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      discount: {
        type: dataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_type: {
        type: dataTypes.ENUM("Fixed", "Percentage"),
        allowNull: false,
        defaultValue: "Percentage",
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
      timestamps: true,
    }
  );

  return Product;
};
