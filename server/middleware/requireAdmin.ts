import { Request, Response, NextFunction } from "express";
import { UserAttributes, ALL_MODULES } from "../types/models";

/**
 * Middleware to check if user has full admin access (all permissions for all modules)
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as UserAttributes;

  if (!user) {
    res.status(401).json({ message: "Unauthorized: No user found" });
    return;
  }

  // Check if user has all permissions for all modules
  const hasFullAccess = ALL_MODULES.every(
    (module) =>
      user.permissions?.[module]?.view &&
      user.permissions?.[module]?.create &&
      user.permissions?.[module]?.edit &&
      user.permissions?.[module]?.delete
  );

  if (hasFullAccess) {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Admin access required" });
  }
};
