import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { SaleReturn } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<SaleReturn> => {
  SaleReturn.init(
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
      CustomerId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
      },
      total_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      refund_method: {
        type: dataTypes.ENUM("Cash", "Card", "Credit", "Exchange"),
        allowNull: false,
        defaultValue: "Cash",
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
      modelName: "SaleReturn",
      tableName: "SaleReturns",
      timestamps: true,
    }
  );

  (SaleReturn as any).associate = (models: any) => {
    SaleReturn.belongsTo(models.Sale, {
      foreignKey: "SaleId",
      as: "sale",
    });
    SaleReturn.belongsTo(models.Customer, {
      foreignKey: "CustomerId",
      as: "customer",
    });
    SaleReturn.hasMany(models.SaleReturnItem, {
      foreignKey: "SaleReturnId",
      as: "items",
    });
  };

  return SaleReturn;
};
