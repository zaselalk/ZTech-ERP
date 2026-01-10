import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  UserPermissions,
  ALL_MODULES,
  ModulePermissions,
} from "../types/models";
const db = require("../db/models");
const { User } = db;

const router = express.Router();

// Default permission for new modules (full access for admin, no access for others)
const DEFAULT_MODULE_PERMISSION: ModulePermissions = {
  view: false,
  create: false,
  edit: false,
  delete: false,
};

// Ensure all modules are present in permissions (handles newly added modules)
const ensureAllModulesPresent = (
  permissions: Partial<UserPermissions>
): UserPermissions => {
  const completePermissions: Partial<UserPermissions> = { ...permissions };

  for (const module of ALL_MODULES) {
    if (!completePermissions[module]) {
      // For new modules, check if user is an admin (has full settings access)
      // If so, give them full access to new modules too
      const isAdmin =
        permissions.settings?.view &&
        permissions.settings?.create &&
        permissions.settings?.edit &&
        permissions.settings?.delete;

      completePermissions[module] = isAdmin
        ? { view: true, create: true, edit: true, delete: true }
        : { ...DEFAULT_MODULE_PERMISSION };
    }
  }

  return completePermissions as UserPermissions;
};

interface LoginRequestBody {
  username: string;
  password: string;
}

router.post(
  "/login",
  async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response
  ): Promise<void> => {
    const { username, password } = req.body;

    // return 400 if username or password is missing
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    try {
      const user = await User.findOne({ where: { username } });

      if (!user) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid username or password" });
        return;
      }

      const jwtSecret =
        process.env.JWT_SECRET || "development_secret_change_in_production";

      const token = jwt.sign({ id: user.id }, jwtSecret, {
        expiresIn: "1h",
      });

      // Ensure all modules are present in permissions (handles newly added modules)
      const completePermissions = ensureAllModulesPresent(user.permissions);

      res.json({
        token,
        username: user.username,
        permissions: completePermissions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export = router;
