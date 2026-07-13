import { Navigate } from "react-router-dom";
import {
  AppPermission,
  hasExplicitPermissions,
  userHasPermission,
} from "@/config/permissions";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
  permission?: AppPermission;
}

export function PrivateRoute({
  children,
  allowedRoles = [],
  permission,
}: PrivateRouteProps) {
  const userStr = localStorage.getItem("InventoryUser");

  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  let user: any = null;

  try {
    user = JSON.parse(userStr);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    if (hasExplicitPermissions(user)) {
      return userHasPermission(user, permission) ? (
        children
      ) : (
        <Navigate to="/unauthorized" replace />
      );
    }

    if (user.role === "admin") {
      return children;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
