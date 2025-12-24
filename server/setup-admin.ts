import readline from "readline";
import bcrypt from "bcrypt";
import { Sequelize } from "sequelize";

// Import database models
const db = require("./db/models");
const { User } = db;

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Helper function to prompt for password (hidden input)
const passwordQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(query);

    let password = "";
    let isRawMode = false;

    // Only use raw mode if stdin is a TTY
    if (stdin.isTTY) {
      (stdin as any).setRawMode(true);
      isRawMode = true;
    }

    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (data: string) => {
      for (let i = 0; i < data.length; i++) {
        const char = data[i];

        switch (char) {
          case "\n":
          case "\r":
            stdin.removeListener("data", onData);
            if (isRawMode) {
              (stdin as any).setRawMode(false);
            }
            stdin.pause();
            stdout.write("\n");
            resolve(password);
            return;
          case "\u0003": // Ctrl+C
            stdin.removeListener("data", onData);
            if (isRawMode) {
              (stdin as any).setRawMode(false);
            }
            process.exit();
            break;
          case "\u007f": // Backspace (Unix)
          case "\b": // Backspace (Windows)
            if (password.length > 0) {
              password = password.slice(0, -1);
              // Clear line and rewrite prompt with asterisks
              stdout.clearLine(0);
              stdout.cursorTo(0);
              stdout.write(query + "*".repeat(password.length));
            }
            break;
          default:
            // Only add printable characters
            if (char >= " " && char <= "~") {
              password += char;
              stdout.write("*");
            }
            break;
        }
      }
    };

    stdin.on("data", onData);
  });
};

// Main setup function
async function setupAdmin() {
  console.log("\n=== BookShop Management System - Admin Setup ===\n");
  console.log("This script will create the first admin user for the system.\n");

  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log("✓ Database connection established successfully.\n");

    // Check if any admin users already exist
    const existingAdmin = await User.findOne({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      const confirm = await question(
        "An admin user already exists. Do you want to create another admin user? (yes/no): "
      );

      if (confirm.toLowerCase() !== "yes" && confirm.toLowerCase() !== "y") {
        console.log("\nSetup cancelled.");
        rl.close();
        process.exit(0);
      }
      console.log("");
    }

    // Get username
    let username = "";
    while (!username.trim()) {
      username = await question("Enter admin username: ");
      if (!username.trim()) {
        console.log("Username cannot be empty. Please try again.\n");
      }
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      where: { username: username.trim() },
    });

    if (existingUser) {
      console.log("\n❌ Error: A user with this username already exists.");
      rl.close();
      process.exit(1);
    }

    // Get password
    let password = "";
    while (password.length < 6) {
      password = await passwordQuestion(
        "Enter admin password (minimum 6 characters): "
      );
      if (password.length < 6) {
        console.log(
          "Password must be at least 6 characters long. Please try again.\n"
        );
      }
    }

    // Confirm password
    const confirmPassword = await passwordQuestion("Confirm admin password: ");

    if (password !== confirmPassword) {
      console.log("\n❌ Error: Passwords do not match.");
      rl.close();
      process.exit(1);
    }

    // Hash password
    console.log("\n\nCreating admin user...");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create admin user
    const admin = await User.create({
      username: username.trim(),
      password: hashedPassword,
      role: "admin",
    });

    console.log("\n✓ Admin user created successfully!");
    console.log(`\nUsername: ${admin.username}`);
    console.log("Role: admin");
    console.log("\nYou can now login to the system with these credentials.");
  } catch (error) {
    console.error("\n❌ Error during setup:", error);
    process.exit(1);
  } finally {
    rl.close();
    // Close database connection
    await db.sequelize.close();
  }
}

// Run setup
setupAdmin().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
