import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Purchase } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Purchase> => {
  Purchase.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      SupplierId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Suppliers",
          key: "id",
        },
      },
      invoiceNumber: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      total_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      paid_amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      payment_status: {
        type: dataTypes.ENUM("Unpaid", "Partial", "Paid"),
        allowNull: false,
        defaultValue: "Unpaid",
      },
      notes: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      purchaseDate: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Purchase",
      tableName: "Purchases",
      timestamps: true,
    }
  );

  (Purchase as any).associate = (models: any) => {
    Purchase.belongsTo(models.Supplier, {
      foreignKey: "SupplierId",
      as: "supplier",
    });
    Purchase.hasMany(models.PurchaseItem, {
      foreignKey: "PurchaseId",
      as: "items",
    });
    Purchase.hasMany(models.SupplierPayment, {
      foreignKey: "PurchaseId",
      as: "payments",
    });
  };

  return Purchase;
};
