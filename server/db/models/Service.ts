import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Service } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Service> => {
  Service.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: dataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: dataTypes.TEXT,
        allowNull: true,
      },
      category: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      cost_price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
      },
      discount: {
        type: dataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_type: {
        type: dataTypes.ENUM("Fixed", "Percentage"),
        allowNull: false,
        defaultValue: "Percentage",
      },
      duration: {
        type: dataTypes.INTEGER,
        allowNull: true,
        comment: "Duration in minutes",
      },
      isActive: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Service",
      tableName: "Services",
      timestamps: true,
    }
  );

  return Service;
};
