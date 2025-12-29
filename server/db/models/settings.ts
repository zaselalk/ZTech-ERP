import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Settings } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Settings> => {
  Settings.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      businessName: {
        type: dataTypes.STRING,
        allowNull: false,
        defaultValue: "My Business",
      },
      address: {
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
      website: {
        type: dataTypes.STRING,
        allowNull: true,
      },
      receiptFooter: {
        type: dataTypes.STRING,
        allowNull: true,
        defaultValue: "Thank you for your business!",
      },
      logoUrl: {
        type: dataTypes.STRING(500),
        allowNull: true,
        defaultValue: null,
      },
      enableSupplierManagement: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enableWarehouseManagement: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      enableProfitTracking: {
        type: dataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Settings",
      tableName: "Settings",
      timestamps: true,
    }
  );

  return Settings;
};
