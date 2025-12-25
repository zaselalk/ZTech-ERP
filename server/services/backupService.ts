import mysqldump from "mysqldump";
import fs from "fs-extra";
import path from "path";
import os from "os";
import crypto from "crypto";
import { spawn } from "child_process";
import { env } from "../config/env";

/**
 * Gets the MySQL command and arguments based on configuration
 * Returns command and base arguments for docker exec or direct mysql execution
 */
function getMySqlCommand(): { command: string; baseArgs: string[] } {
  // If MySQL is running in a Docker container, use docker exec
  if (env.MYSQL_DOCKER_CONTAINER) {
    console.log(`Using MySQL Docker container: ${env.MYSQL_DOCKER_CONTAINER}`);
    return {
      command: "docker",
      baseArgs: ["exec", "-i", env.MYSQL_DOCKER_CONTAINER, "mysql"],
    };
  }

  // Fallback to mysql in PATH (for local installations)
  throw new Error(
    "MySQL Docker container not configured. Please set MYSQL_DOCKER_CONTAINER environment variable.\n" +
      'Example: MYSQL_DOCKER_CONTAINER="MySQL"'
  );
}

/**
 * Drops all tables in the database to prepare for restore
 * This prevents duplicate key errors when restoring
 */
async function dropAllTables(): Promise<void> {
  if (!env.MYSQL_DOCKER_CONTAINER) {
    throw new Error("Database clearing only supported in Docker mode");
  }

  const configContent = `[client]
host=${env.DB_HOST}
user=${env.DB_USER}
password=${env.DB_PASSWORD}
`;

  const containerConfigPath = `/tmp/mysql-drop-${Date.now()}.cnf`;

  try {
    // 1. Write config file to container
    await new Promise<void>((resolve, reject) => {
      const child = spawn("docker", [
        "exec",
        "-i",
        env.MYSQL_DOCKER_CONTAINER!,
        "sh",
        "-c",
        `cat > ${containerConfigPath}`,
      ]);

      child.stdin.write(configContent);
      child.stdin.end();

      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to write config (code ${code})`));
      });
    });

    // 2. Use a bash script to generate and execute DROP statements
    const dropScript = `
mysql --defaults-file=${containerConfigPath} -N -B -e "
SET FOREIGN_KEY_CHECKS = 0;
SELECT CONCAT('DROP TABLE IF EXISTS \\\`', table_name, '\\\`;')
FROM information_schema.tables
WHERE table_schema = '${env.DB_NAME}';" | mysql --defaults-file=${containerConfigPath} ${env.DB_NAME}
mysql --defaults-file=${containerConfigPath} -e "SET FOREIGN_KEY_CHECKS = 1;"
`;

    await new Promise<void>((resolve, reject) => {
      const dropProcess = spawn("docker", [
        "exec",
        "-i",
        env.MYSQL_DOCKER_CONTAINER!,
        "sh",
        "-c",
        dropScript.trim(),
      ]);

      let stderr = "";
      dropProcess.stderr.on("data", (d) => (stderr += d.toString()));
      dropProcess.on("error", reject);
      dropProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`Drop tables error: ${stderr}`);
          reject(new Error(`Failed to drop tables (code ${code})`));
        } else {
          resolve();
        }
      });
    });
  } finally {
    // Cleanup config file
    spawn("docker", [
      "exec",
      env.MYSQL_DOCKER_CONTAINER!,
      "rm",
      "-f",
      containerConfigPath,
    ]).unref();
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

    // Create a temporary MySQL configuration file with secure permissions
    // This prevents password exposure in process listings
    const configContent = `[client]
host=${env.DB_HOST}
user=${env.DB_USER}
password=${env.DB_PASSWORD}
`;

    // Handle Docker container restore
    if (env.MYSQL_DOCKER_CONTAINER) {
      const containerConfigPath = `/tmp/mysql-restore-${Date.now()}.cnf`;

      try {
        // 1. Drop all existing tables to prevent duplicate key errors
        console.log("Dropping all tables before restore...");
        await dropAllTables();
        console.log("All tables dropped successfully");

        // 2. Write config file to container
        await new Promise<void>((resolve, reject) => {
          const child = spawn("docker", [
            "exec",
            "-i",
            env.MYSQL_DOCKER_CONTAINER!,
            "sh",
            "-c",
            `cat > ${containerConfigPath}`,
          ]);

          child.stdin.write(configContent);
          child.stdin.end();

          child.on("error", reject);
          child.on("close", (code) => {
            if (code === 0) resolve();
            else
              reject(
                new Error(`Failed to write config to container (code ${code})`)
              );
          });
        });

        // 3. Execute restore
        await new Promise<string>((resolve, reject) => {
          const mysql = spawn("docker", [
            "exec",
            "-i",
            env.MYSQL_DOCKER_CONTAINER!,
            "mysql",
            `--defaults-file=${containerConfigPath}`,
            env.DB_NAME,
          ]);

          let stderr = "";
          mysql.stderr.on("data", (d) => (stderr += d.toString()));
          mysql.on("error", reject);
          mysql.on("close", (code) => {
            if (code !== 0) {
              console.error(`Restore stderr: ${stderr}`);
              reject(new Error(`mysql process exited with code ${code}`));
            } else {
              resolve("Restored");
            }
          });

          const fileStream = fs.createReadStream(filePath);
          fileStream.pipe(mysql.stdin);
          fileStream.on("error", reject);
        });

        return "Database restored successfully";
      } finally {
        // 4. Cleanup config file in container
        spawn("docker", [
          "exec",
          env.MYSQL_DOCKER_CONTAINER!,
          "rm",
          containerConfigPath,
        ]).unref();
      }
    }

    // Fallback to local MySQL restore
    // Generate a unique temporary filename using random bytes to prevent race conditions
    const randomSuffix = crypto.randomBytes(8).toString("hex");
    const tmpConfig = path.join(
      os.tmpdir(),
      `mysql-${Date.now()}-${randomSuffix}.cnf`
    );

    try {
      // Write config file with restricted permissions (readable only by owner)
      await fs.writeFile(tmpConfig, configContent, { mode: 0o600 });

      // Get MySQL command (docker exec or direct mysql)
      const { command, baseArgs } = getMySqlCommand();

      // Build full arguments list
      const args = [...baseArgs, `--defaults-file=${tmpConfig}`, env.DB_NAME];

      console.log(`Executing: ${command} ${args.join(" ")}`);

      // Execute mysql command using the secure config file
      await new Promise<string>((resolve, reject) => {
        const mysql = spawn(command, args);

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
        console.error(
          "Failed to clean up temporary config file:",
          cleanupError
        );
      }
    }
  },
};
