import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

export function PrivateRoute({
  children,
  allowedRoles = [],
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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
