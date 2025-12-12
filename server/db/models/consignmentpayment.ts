import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { ConsignmentPayment } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<ConsignmentPayment> => {
  ConsignmentPayment.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bookshopId: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      amount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      paymentDate: {
        type: dataTypes.DATE,
        allowNull: false,
      },
      note: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ConsignmentPayment",
      tableName: "ConsignmentPayments",
      timestamps: true,
    }
  );

  // Define associations
  (ConsignmentPayment as any).associate = (models: any) => {
    ConsignmentPayment.belongsTo(models.Bookshop, {
      foreignKey: "bookshopId",
      as: "bookshop",
    });
  };

  return ConsignmentPayment;
};
