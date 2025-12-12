import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { Book } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<Book> => {
  Book.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      barcode: {
        type: dataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      publisher: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      genre: {
        type: dataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      reorder_threshold: {
        type: dataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      discount: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discount_type: {
        type: dataTypes.ENUM("Fixed", "Percentage"),
        allowNull: false,
        defaultValue: "Fixed",
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "Books",
      timestamps: true,
    }
  );

  // Define associations
  (Book as any).associate = (models: any) => {
    Book.belongsToMany(models.Sale, {
      through: "SaleItem",
      as: "sales",
      foreignKey: "BookId",
    });
  };

  return Book;
};
