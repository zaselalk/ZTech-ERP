import { Sequelize, DataTypes, ModelStatic } from "sequelize";
import { User, Bookshop, Book, Sale, SaleItem } from "../../types/models";

const fs = require("fs");
const path = require("path");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config")[env];

interface DB {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  User: ModelStatic<User>;
  Bookshop: ModelStatic<Bookshop>;
  Book: ModelStatic<Book>;
  Sale: ModelStatic<Sale>;
  SaleItem: ModelStatic<SaleItem>;
}

const db = {} as DB;

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(
    process.env[config.use_env_variable] as string,
    config
  );
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      (file.slice(-3) === ".ts" || file.slice(-3) === ".js") &&
      file.indexOf(".test.ts") === -1 &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file: string) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name as keyof DB] = model;
  });

Object.keys(db).forEach((modelName) => {
  const model = db[modelName as keyof DB] as any;
  if (model.associate) {
    model.associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export = db;
