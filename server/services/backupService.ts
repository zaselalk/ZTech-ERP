import mysqldump from "mysqldump";
import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import { env } from "../config/env";

const BACKUP_DIR = path.join(__dirname, "../../backups");

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_DIR);

export const backupService = {
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, filename);

    try {
      await mysqldump({
        connection: {
          host: env.DB_HOST,
          user: env.DB_USER,
          password: env.DB_PASSWORD,
          database: env.DB_NAME,
        },
        dumpToFile: filePath,
      });

      return { filename, filePath };
    } catch (error) {
      console.error("Backup failed:", error);
      throw error;
    }
  },

  async listBackups() {
    try {
      const files = await fs.readdir(BACKUP_DIR);
      const backups = await Promise.all(
        files
          .filter((file) => file.endsWith(".sql"))
          .map(async (file) => {
            const stats = await fs.stat(path.join(BACKUP_DIR, file));
            return {
              filename: file,
              size: stats.size,
              createdAt: stats.birthtime,
            };
          })
      );
      // Sort by date descending
      return backups.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      console.error("List backups failed:", error);
      throw error;
    }
  },

  async deleteBackup(filename: string) {
    try {
      const filePath = path.join(BACKUP_DIR, filename);
      if (await fs.pathExists(filePath)) {
        await fs.unlink(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Delete backup failed:", error);
      throw error;
    }
  },

  async restoreBackup(filename: string) {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!(await fs.pathExists(filePath))) {
      throw new Error("Backup file not found");
    }

    // Construct the mysql command
    // Note: This requires 'mysql' to be in the system PATH
    const command = `mysql -h ${env.DB_HOST} -u ${env.DB_USER} -p ${env.DB_PASSWORD} ${env.DB_NAME} < "${filePath}"`;

    /**
     * This should be change to send more useful message on error to client, instead of just console logging.
     * this also explore the username and password to the client in mysql server
     */
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Restore error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          // mysql command might output warnings to stderr, which isn't necessarily a failure
          console.warn(`Restore stderr: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
};
