import { Request, Response, NextFunction } from "express";
import {
  UserAttributes,
  UserPermissions,
  ModuleName,
  ModulePermission,
} from "../types/models";

/**
 * Get effective permissions for a user.
 * Permissions are now always explicitly stored on the user.
 */
export function getEffectivePermissions(user: UserAttributes): UserPermissions {
  return user.permissions;
}

/**
 * Check if user has a specific permission for a module
 */
export function hasPermission(
  user: UserAttributes,
  module: ModuleName,
  permission: ModulePermission
): boolean {
  const permissions = getEffectivePermissions(user);
  return permissions[module]?.[permission] ?? false;
}

/**
 * Middleware factory to check if user has permission for a specific module and action
 */
export function requirePermission(
  module: ModuleName,
  permission: ModulePermission
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserAttributes;

    if (!user) {
      res.status(401).json({ message: "Unauthorized: No user found" });
      return;
    }

    if (hasPermission(user, module, permission)) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: You don't have ${permission} permission for ${module}`,
      });
    }
  };
}

/**
 * Middleware to check if user has view permission for a module
 */
export function requireViewPermission(module: ModuleName) {
  return requirePermission(module, "view");
}

/**
 * Middleware to check if user has create permission for a module
 */
export function requireCreatePermission(module: ModuleName) {
  return requirePermission(module, "create");
}

/**
 * Middleware to check if user has edit permission for a module
 */
export function requireEditPermission(module: ModuleName) {
  return requirePermission(module, "edit");
}

/**
 * Middleware to check if user has delete permission for a module
 */
export function requireDeletePermission(module: ModuleName) {
  return requirePermission(module, "delete");
}

/**
 * Middleware to check if user has any of the specified permissions for a module
 */
export function requireAnyPermission(
  module: ModuleName,
  permissions: ModulePermission[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserAttributes;

    if (!user) {
      res.status(401).json({ message: "Unauthorized: No user found" });
      return;
    }

    const hasAny = permissions.some((perm) =>
      hasPermission(user, module, perm)
    );

    if (hasAny) {
      next();
    } else {
      res.status(403).json({
        message: `Forbidden: You don't have required permission for ${module}`,
      });
    }
  };
}
