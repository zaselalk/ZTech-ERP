import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Sale } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Sale> => {
  Sale.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      total_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: dataTypes.ENUM(
          "Cash",
          "Card",
          "Consignment",
          "Paid",
          "Cash On Delivery"
        ),
        allowNull: false,
      },
      CustomerId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Customers",
          key: "id",
        },
      },
      discount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Sale",
      tableName: "Sales",
      timestamps: true,
    }
  );

  // Define associations
  (Sale as any).associate = (models: any) => {
    Sale.belongsTo(models.Customer, {
      foreignKey: "CustomerId",
      as: "customer",
    });
    Sale.belongsToMany(models.Product, {
      through: "SaleItem",
      as: "products",
      foreignKey: "SaleId",
    });
    Sale.hasMany(models.SaleItem, {
      as: "items",
      foreignKey: "SaleId",
    });
  };

  return Sale;
};
