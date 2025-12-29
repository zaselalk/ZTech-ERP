import { Navigate } from "react-router-dom";
import { Result, Button } from "antd";
import { usePermissions } from "../hooks/usePermissions";
import { ModuleName, ModulePermission } from "../types";

interface PermissionGuardProps {
  children: React.ReactNode;
  module: ModuleName;
  permission?: ModulePermission;
  fallback?: "redirect" | "forbidden" | "hidden";
  redirectTo?: string;
}

/**
 * Permission Guard component that checks if user has permission to access a module
 *
 * @param children - The content to render if user has permission
 * @param module - The module to check permission for
 * @param permission - The specific permission to check (default: "view")
 * @param fallback - What to show if user doesn't have permission:
 *                   - "redirect": Navigate to another page
 *                   - "forbidden": Show 403 forbidden page
 *                   - "hidden": Render nothing
 * @param redirectTo - URL to redirect to (default: "/")
 */
const PermissionGuard = ({
  children,
  module,
  permission = "view",
  fallback = "forbidden",
  redirectTo = "/",
}: PermissionGuardProps) => {
  const { hasPermission, canView } = usePermissions();

  // Check if user has the required permission
  const hasAccess =
    permission === "view" ? canView(module) : hasPermission(module, permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Handle different fallback behaviors
  switch (fallback) {
    case "redirect":
      return <Navigate to={redirectTo} replace />;

    case "hidden":
      return null;

    case "forbidden":
    default:
      return (
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access this page."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      );
  }
};

/**
 * Higher-order component to wrap a component with permission check
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: ModuleName,
  permission: ModulePermission = "view"
) {
  return function PermissionWrapper(props: P) {
    return (
      <PermissionGuard module={module} permission={permission}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
}

export default PermissionGuard;
