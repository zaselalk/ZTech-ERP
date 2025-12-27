import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Customer } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Customer> => {
  Customer.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      credit_balance: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      address: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Customer",
      tableName: "Customers",
      timestamps: true,
    }
  );

  // Define associations
  (Customer as any).associate = (models: any) => {
    Customer.hasMany(models.Sale, {
      foreignKey: "CustomerId",
      as: "sales",
    });
    Customer.hasMany(models.ConsignmentPayment, {
      foreignKey: "customerId",
      as: "consignmentPayments",
    });
  };

  return Customer;
};
