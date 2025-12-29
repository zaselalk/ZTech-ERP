import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Supplier } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Supplier> => {
  Supplier.init(
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
      contactPerson: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      notes: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "Suppliers",
      timestamps: true,
    }
  );

  return Supplier;
};
