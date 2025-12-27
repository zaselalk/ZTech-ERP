import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Quotation } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Quotation> => {
  Quotation.init(
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
      expiresAt: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: dataTypes.ENUM("Active", "Converted"),
        allowNull: false,
        defaultValue: "Active",
      },
    },
    {
      sequelize,
      modelName: "Quotation",
      tableName: "Quotations",
      timestamps: true,
    }
  );

  // Define associations
  (Quotation as any).associate = (models: any) => {
    Quotation.belongsTo(models.Customer, {
      foreignKey: "CustomerId",
      as: "customer",
    });
    Quotation.hasMany(models.QuotationItem, {
      foreignKey: "QuotationId",
      as: "items",
    });
  };

  return Quotation;
};
