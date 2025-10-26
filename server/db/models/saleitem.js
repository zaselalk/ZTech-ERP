'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SaleItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SaleItem.belongsTo(models.Sale, {
        foreignKey: 'SaleId',
        as: 'sale',
      });
      SaleItem.belongsTo(models.Book, {
        foreignKey: 'BookId',
        as: 'book',
      });
    }
  }
  SaleItem.init({
    SaleId: DataTypes.INTEGER,
    BookId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'SaleItem',
  });
  return SaleItem;
};