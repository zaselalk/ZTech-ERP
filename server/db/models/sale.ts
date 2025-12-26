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
      BookshopId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Bookshops",
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
    Sale.belongsTo(models.Bookshop, {
      foreignKey: "BookshopId",
      as: "bookshop",
    });
    Sale.belongsToMany(models.Book, {
      through: "SaleItem",
      as: "books",
      foreignKey: "SaleId",
    });
  };

  return Sale;
};
