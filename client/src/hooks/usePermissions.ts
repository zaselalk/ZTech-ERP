import { authService } from "../services";
import {
  ModuleName,
  ModulePermission,
  UserPermissions,
  ALL_MODULES,
} from "../types";

/**
 * Custom hook to access and check user permissions
 */
export const usePermissions = () => {
  const permissions = authService.getPermissions();

  /**
   * Check if user has a specific permission for a module
   */
  const hasPermission = (
    module: ModuleName,
    permission: ModulePermission
  ): boolean => {
    return authService.hasPermission(module, permission);
  };

  /**
   * Check if user can view a module
   */
  const canView = (module: ModuleName): boolean => {
    return authService.canView(module);
  };

  /**
   * Check if user can create in a module
   */
  const canCreate = (module: ModuleName): boolean => {
    return authService.canCreate(module);
  };

  /**
   * Check if user can edit in a module
   */
  const canEdit = (module: ModuleName): boolean => {
    return authService.canEdit(module);
  };

  /**
   * Check if user can delete in a module
   */
  const canDelete = (module: ModuleName): boolean => {
    return authService.canDelete(module);
  };

  /**
   * Check if user has full access (all permissions for all modules)
   */
  const hasFullAccess = (): boolean => {
    if (!permissions) return false;
    return ALL_MODULES.every(
      (module) =>
        permissions[module]?.view &&
        permissions[module]?.create &&
        permissions[module]?.edit &&
        permissions[module]?.delete
    );
  };

  /**
   * Get all permissions
   */
  const getPermissions = (): UserPermissions | null => {
    return permissions;
  };

  return {
    permissions,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    hasFullAccess,
    getPermissions,
  };
};

export default usePermissions;
