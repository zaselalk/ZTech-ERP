import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import { UserAttributes, DEFAULT_PERMISSIONS } from "../types/models";
import {
  requireCreatePermission,
  requireEditPermission,
  requireDeletePermission,
} from "../middleware/requirePermission";

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

// Get default permissions for new users
router.get(
  "/default-permissions",
  async (req: Request, res: Response): Promise<void> => {
    res.json(DEFAULT_PERMISSIONS);
  }
);

// Create a new user
router.post(
  "/",
  requireCreatePermission("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, permissions } = req.body;

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
        permissions: permissions || DEFAULT_PERMISSIONS,
      });

      const userResponse = newUser.toJSON() as UserAttributes;
      // @ts-ignore
      delete userResponse.password;

      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Update a user
router.put(
  "/:id",
  requireEditPermission("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { username, password, permissions } = req.body;

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

      // Update permissions if provided
      if (permissions !== undefined) {
        user.permissions = permissions;
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
  }
);

// Delete a user
router.delete(
  "/:id",
  requireDeletePermission("users"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Prevent deleting if this would leave no users with user management permissions
      const usersWithPermission = await User.findAll();
      const canManageUsers = usersWithPermission.filter(
        (u: any) => u.id !== parseInt(id) && u.permissions?.users?.delete
      );

      if (canManageUsers.length === 0) {
        res.status(403).json({
          message:
            "Cannot delete the last user with user management permissions.",
        });
        return;
      }

      await user.destroy();
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
