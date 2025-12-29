import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Warehouse } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Warehouse> => {
  Warehouse.init(
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
      code: {
        type: dataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      location: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: dataTypes.TEXT,
        allowNull: true,
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
      capacity: {
        type: dataTypes.INTEGER,
        allowNull: true,
      },
      notes: {
        type: dataTypes.TEXT,
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
      modelName: "Warehouse",
      tableName: "Warehouses",
      timestamps: true,
    }
  );

  return Warehouse;
};
