import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Bookshop } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Bookshop> => {
  Bookshop.init(
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
      consignment: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      location: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      contact: {
        type: dataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Bookshop",
      tableName: "Bookshops",
      timestamps: true,
    }
  );

  // Define associations
  (Bookshop as any).associate = (models: any) => {
    Bookshop.hasMany(models.Sale, {
      foreignKey: "BookshopId",
      as: "sales",
    });
  };

  return Bookshop;
};
