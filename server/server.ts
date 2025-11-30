import db from "./db/models";
import { createApp } from "./app";
import { env, validateEnv } from "./config/env";
import cron from "node-cron";
import { backupService } from "./services/backupService";

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

  // Schedule daily backup at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Starting automated backup...");
    try {
      await backupService.createBackup();
      console.log("Automated backup completed successfully.");
    } catch (error) {
      console.error("Automated backup failed:", error);
    }
  });

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });
}
