import mysqldump from "mysqldump";
import fs from "fs-extra";
import path from "path";
import crypto from "crypto";
import { spawn } from "child_process";
import mysql from "mysql2/promise";
import { env } from "../config/env";

/**
 * Helper to write config content securely to the local container
 */
async function writeSecureConfig(
  filePath: string,
  content: string
): Promise<void> {
  // Write file locally with 600 permissions (read/write by owner only)
  await fs.writeFile(filePath, content, { mode: 0o600 });
}

/**
 * Helper to remove config file from the local container
 */
async function removeSecureConfig(filePath: string): Promise<void> {
  try {
    // Attempt to delete the file
    await fs.unlink(filePath);
  } catch (error) {
    // If file is already gone, just ignore the error
    console.warn(`Warning: Failed to delete temp config ${filePath}`, error);
  }
}

/**
 * Recreates the database to prepare for restore
 * This connects over the network (TCP) so it works perfectly in Docker
 */
async function recreateDatabase(): Promise<void> {
  try {
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      multipleStatements: true,
    });

    try {
      console.log(`Recreating database ${env.DB_NAME}...`);
      await connection.query(`DROP DATABASE IF EXISTS \`${env.DB_NAME}\``);
      await connection.query(`CREATE DATABASE \`${env.DB_NAME}\``);
    } finally {
      await connection.end();
    }
  } catch (err) {
    console.error("Failed to recreate database:", err);
    throw err;
  }
}

const BACKUP_DIR = path.join(__dirname, "../../backups");

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_DIR);

export const backupService = {
  /**
   * Creates a backup using mysqldump (TCP connection)
   */
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

  /**
   * Restores a backup using local mysql client
   */
  async restoreBackup(filename: string) {
    const filePath = path.join(BACKUP_DIR, filename);
    if (!(await fs.pathExists(filePath))) {
      throw new Error("Backup file not found");
    }

    const randomSuffix = crypto.randomBytes(8).toString("hex");
    // Use the container's local /tmp directory
    const configPath = `/tmp/mysql-restore-${Date.now()}-${randomSuffix}.cnf`;

    // Config points to the DATABASE CONTAINER host
    const configContent = `[client]
host=${env.DB_HOST}
user=${env.DB_USER}
password=${env.DB_PASSWORD}
`;

    try {
      // 1. Recreate database (Clean slate)
      await recreateDatabase();

      // 2. Write config locally
      await writeSecureConfig(configPath, configContent);

      // 3. Spawn the MySQL process (Locally installed client)
      // We pipe the file stream into this process
      await new Promise<void>((resolve, reject) => {
        const mysqlProcess = spawn("mariadb", [
          `--defaults-file=${configPath}`,
          "--skip-ssl",
          env.DB_NAME as string,
        ]);

        let stderr = "";
        mysqlProcess.stderr.on("data", (d) => (stderr += d.toString()));

        const fileStream = fs.createReadStream(filePath);

        // Pipe the backup file content into MySQL stdin
        fileStream.pipe(mysqlProcess.stdin);

        mysqlProcess.on("close", (code) => {
          if (code !== 0) {
            console.error(`Restore stderr: ${stderr}`);
            reject(new Error(`MySQL process exited with code ${code}`));
          } else {
            resolve();
          }
        });

        // Handle errors if 'mysql' command is missing or fails to start
        mysqlProcess.on("error", (err) => {
          reject(
            new Error(
              `Failed to spawn 'mysql'. Is the client installed? (${err.message})`
            )
          );
        });

        fileStream.on("error", reject);
      });

      return "Database restored successfully";
    } finally {
      // 4. Always cleanup the secret config file
      await removeSecureConfig(configPath);
    }
  },
};
