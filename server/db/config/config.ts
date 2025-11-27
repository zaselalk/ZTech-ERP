import dotenv from "dotenv";
dotenv.config();

interface DatabaseConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  dialect: "mysql" | "postgres" | "sqlite" | "mariadb" | "mssql";
}

interface Config {
  development: DatabaseConfig;
  test: DatabaseConfig;
  production: DatabaseConfig;
}

const config: Config = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "bookshop_db",
    host: process.env.DB_HOST || "localhost",
    dialect: (process.env.DB_DIALECT as any) || "mysql",
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME_TEST || "bookshop_db_test",
    host: process.env.DB_HOST || "localhost",
    dialect: (process.env.DB_DIALECT as any) || "mysql",
  },
  production: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME_PROD || "bookshop_db_prod",
    host: process.env.DB_HOST || "localhost",
    dialect: (process.env.DB_DIALECT as any) || "mysql",
  },
};

export = config;
