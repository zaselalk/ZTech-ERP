'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sale.belongsTo(models.Bookshop, {
        foreignKey: 'BookshopId',
        as: 'bookshop',
      });
      Sale.belongsToMany(models.Book, {
        through: 'SaleItem',
        as: 'books',
        foreignKey: 'SaleId',
      });
    }
  }
  Sale.init({
    total_amount: DataTypes.DECIMAL,
    payment_method: DataTypes.ENUM('Cash', 'Card', 'Consignment'),
    BookshopId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Sale',
  });
  return Sale;
};