import { Request, Response, NextFunction } from "express";
import { UserAttributes } from "../types/models";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as UserAttributes;

  if (user && user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};
