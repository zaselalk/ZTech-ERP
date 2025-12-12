import mysqldump from "mysqldump";
import fs from "fs-extra";
import path from "path";
import os from "os";
import crypto from "crypto";
import { spawn } from "child_process";
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

    // Create a temporary MySQL configuration file with secure permissions
    // This prevents password exposure in process listings
    const configContent = `[client]
host=${env.DB_HOST}
user=${env.DB_USER}
password=${env.DB_PASSWORD}
`;

    // Generate a unique temporary filename using random bytes to prevent race conditions
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const tmpConfig = path.join(os.tmpdir(), `mysql-${Date.now()}-${randomSuffix}.cnf`);
    
    try {
      // Write config file with restricted permissions (readable only by owner)
      await fs.writeFile(tmpConfig, configContent, { mode: 0o600 });

      // Execute mysql command using the secure config file
      // Note: This requires 'mysql' to be in the system PATH
      await new Promise<string>((resolve, reject) => {
        const mysql = spawn("mysql", [
          `--defaults-file=${tmpConfig}`,
          env.DB_NAME,
        ]);

        let stdout = "";
        let stderr = "";

        mysql.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        mysql.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        mysql.on("error", (error) => {
          reject(error);
        });

        mysql.on("close", (code) => {
          if (code !== 0) {
            console.error(`Restore error: mysql exited with code ${code}`);
            console.error(`stderr: ${stderr}`);
            reject(new Error(`mysql process exited with code ${code}`));
          } else {
            if (stderr) {
              // mysql command might output warnings to stderr, which isn't necessarily a failure
              console.warn(`Restore stderr: ${stderr}`);
            }
            resolve(stdout);
          }
        });

        // Pipe the backup file to mysql stdin
        const fileStream = fs.createReadStream(filePath);
        
        // Register error handler before piping to prevent race conditions
        fileStream.on("error", (error) => {
          reject(error);
        });

        // End stdin when file stream is done to signal EOF to mysql process
        fileStream.on("end", () => {
          mysql.stdin.end();
        });

        try {
          fileStream.pipe(mysql.stdin);
        } catch (pipeError) {
          reject(pipeError);
        }
      });

      return "Database restored successfully";
    } catch (error) {
      console.error(`Restore error:`, error);
      throw error;
    } finally {
      // Always clean up the temporary config file
      try {
        if (await fs.pathExists(tmpConfig)) {
          await fs.unlink(tmpConfig);
        }
      } catch (cleanupError) {
        console.error("Failed to clean up temporary config file:", cleanupError);
      }
    }
  },
};
