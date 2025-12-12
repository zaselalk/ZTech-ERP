import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { QuotationItem } from "../../types/models";

export = (
  sequelize: Sequelize,
  dataTypes: typeof DataTypes
): ModelStatic<QuotationItem> => {
  QuotationItem.init(
    {
      id: {
        type: dataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      QuotationId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Quotations",
          key: "id",
        },
      },
      BookId: {
        type: dataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
      },
      quantity: {
        type: dataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: dataTypes.DECIMAL(10, 2),
        allowNull: false,
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
      modelName: "QuotationItem",
      tableName: "QuotationItems",
      timestamps: true,
    }
  );

  // Define associations
  (QuotationItem as any).associate = (models: any) => {
    QuotationItem.belongsTo(models.Quotation, {
      foreignKey: "QuotationId",
      as: "quotation",
    });
    QuotationItem.belongsTo(models.Book, {
      foreignKey: "BookId",
      as: "book",
    });
  };

  return QuotationItem;
};
