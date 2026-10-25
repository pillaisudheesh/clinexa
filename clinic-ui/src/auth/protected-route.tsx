import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "./auth-context";

export function ProtectedRoute() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  console.log(user);

  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-background">
        <div className="text-sm text-app-muted">Loading SamaRoot...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (user?.mustChangePassword === true) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
