import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserPermissions } from "../types/models";
const db = require("../db/models");
const { User } = db;

const router = express.Router();

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

      res.json({
        token,
        username: user.username,
        permissions: user.permissions as UserPermissions,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export = router;
