import db from "./db/models";
import { createApp } from "./app";
import { env, validateEnv } from "./config/env";

export async function start(): Promise<void> {
  validateEnv();

  await db.sequelize
    .authenticate()
    .then(() => {
      console.log("Database connection has been established successfully.");
    })
    .catch((err: Error) => {
      console.error("Unable to connect to the database:", err);
      throw err;
    });

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
}
