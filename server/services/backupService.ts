import mysqldump from "mysqldump";
import fs from "fs-extra";
import path from "path";
import os from "os";
import crypto from "crypto";
import { spawn } from "child_process";
import mysql from "mysql2/promise";
import { env } from "../config/env";

/**
 * Gets the MySQL command and arguments based on configuration
 */
function getMySqlCommand(): { command: string; baseArgs: string[] } {
  if (env.MYSQL_DOCKER_CONTAINER) {
    return {
      command: "docker",
      baseArgs: ["exec", "-i", env.MYSQL_DOCKER_CONTAINER, "mysql"],
    };
  }

  // Fixed: Actually return local command instead of throwing
  return {
    command: "mysql",
    baseArgs: [],
  };
}

/**
 * Helper to write config content securely
 */
async function writeSecureConfig(
  filePath: string,
  content: string,
  isDocker: boolean
): Promise<void> {
  if (isDocker && env.MYSQL_DOCKER_CONTAINER) {
    await new Promise<void>((resolve, reject) => {
      const child = spawn("docker", [
        "exec",
        "-i",
        env.MYSQL_DOCKER_CONTAINER!,
        "sh",
        "-c",
        `cat > ${filePath}`,
      ]);
      child.stdin.write(content);
      child.stdin.end();
      child.on("close", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`Failed to write config (code ${code})`))
      );
      child.on("error", reject);
    });
  } else {
    await fs.writeFile(filePath, content, { mode: 0o600 });
  }
}

/**
 * Helper to remove config file
 */
async function removeSecureConfig(
  filePath: string,
  isDocker: boolean
): Promise<void> {
  if (isDocker && env.MYSQL_DOCKER_CONTAINER) {
    spawn("docker", [
      "exec",
      env.MYSQL_DOCKER_CONTAINER,
      "rm",
      "-f",
      filePath,
    ]).unref();
  } else {
    if (await fs.pathExists(filePath)) {
      await fs.unlink(filePath);
    }
  }
}

/**
 * Recreates the database to prepare for restore
 */
async function recreateDatabase(): Promise<void> {
  try {
    // Create a connection without selecting a database to perform DB operations
    const connection = await mysql.createConnection({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      multipleStatements: true,
    });

    try {
      console.log(`Recreating database ${env.DB_NAME}...`);

      // Drop and recreate database
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

    const isDocker = !!env.MYSQL_DOCKER_CONTAINER;
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const configPath = `/tmp/mysql-restore-${Date.now()}-${randomSuffix}.cnf`;

    const configContent = `[client]
host=${env.DB_HOST}
user=${env.DB_USER}
password=${env.DB_PASSWORD}
`;

    try {
      // 1. Recreate database (Unified logic)
      console.log("Recreating database before restore...");
      await recreateDatabase();

      // 2. Write config
      await writeSecureConfig(configPath, configContent, isDocker);

      // 3. Execute Restore
      const { command, baseArgs } = getMySqlCommand();
      const args = [...baseArgs, `--defaults-file=${configPath}`, env.DB_NAME];

      await new Promise<void>((resolve, reject) => {
        const mysql = spawn(command, args);

        let stderr = "";
        mysql.stderr.on("data", (d) => (stderr += d.toString()));

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(mysql.stdin);

        mysql.on("close", (code) => {
          if (code !== 0) {
            console.error(`Restore stderr: ${stderr}`);
            reject(new Error(`mysql process exited with code ${code}`));
          } else resolve();
        });

        mysql.on("error", reject);
        fileStream.on("error", reject);
      });

      return "Database restored successfully";
    } finally {
      await removeSecureConfig(configPath, isDocker);
    }
  },
};
