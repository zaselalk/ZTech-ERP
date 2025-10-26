'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bookshop extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Bookshop.hasMany(models.Sale, {
        foreignKey: 'BookshopId',
        as: 'sales',
      });
    }
  }
  Bookshop.init({
    name: DataTypes.STRING,
    consignment: DataTypes.DECIMAL,
    location: DataTypes.STRING,
    contact: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Bookshop',
  });
  return Bookshop;
};