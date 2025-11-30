import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserAttributes } from "../types/models";

const db = require("../db/models");
const { User } = db;

const router = express.Router();

// Get all users
router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new user
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: "Username already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      role: role || "staff",
    });

    const userResponse = newUser.toJSON() as UserAttributes;
    // @ts-ignore
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a user
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        res.status(400).json({ message: "Username already exists" });
        return;
      }
      user.username = username;
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      user.role = role;
    }

    await user.save();

    const userResponse = user.toJSON() as UserAttributes;
    // @ts-ignore
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a user
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role === "admin") {
      res.status(403).json({
        message: "Cannot delete an admin account. Demote to staff first.",
      });
      return;
    }

    // Prevent deleting the last admin or self-deletion could be added here if needed
    // For now, just delete
    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
