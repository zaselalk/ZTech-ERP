import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { SupplierPayment } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<SupplierPayment> => {
  SupplierPayment.init(
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
      PurchaseId: {
        type: dataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Purchases",
          key: "id",
        },
      },
      amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: dataTypes.ENUM("Cash", "Card", "Bank Transfer", "Cheque"),
        allowNull: false,
        defaultValue: "Cash",
      },
      reference: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      paymentDate: {
        type: dataTypes.DATE,
        allowNull: false,
        defaultValue: dataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "SupplierPayment",
      tableName: "SupplierPayments",
      timestamps: true,
    }
  );

  (SupplierPayment as any).associate = (models: any) => {
    SupplierPayment.belongsTo(models.Supplier, {
      foreignKey: "SupplierId",
      as: "supplier",
    });
    SupplierPayment.belongsTo(models.Purchase, {
      foreignKey: "PurchaseId",
      as: "purchase",
    });
  };

  return SupplierPayment;
};
