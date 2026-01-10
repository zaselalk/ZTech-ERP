import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { ProductVariant } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<ProductVariant> => {
  ProductVariant.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      ProductId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      sku: {
        type: dataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      barcode: {
        type: dataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      cost_price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      attributes: {
        type: dataTypes.JSON,
        allowNull: true,
      },
      isActive: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "ProductVariants",
      timestamps: true,
    }
  );

  // Define associations
  (ProductVariant as any).associate = (models: any) => {
    ProductVariant.belongsTo(models.Product, {
      foreignKey: "ProductId",
      as: "product",
    });
  };

  return ProductVariant;
};
