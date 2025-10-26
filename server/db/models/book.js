'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Book.belongsTo(models.Bookshop, {
        foreignKey: 'BookshopId',
        as: 'bookshop',
      });
      Book.belongsToMany(models.Sale, {
        through: 'SaleItem',
        as: 'sales',
        foreignKey: 'BookId',
      });
    }
  }
  Book.init({
    barcode: DataTypes.STRING,
    name: DataTypes.STRING,
    author: DataTypes.STRING,
    publisher: DataTypes.STRING,
    genre: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    reorder_threshold: DataTypes.INTEGER,
    BookshopId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};