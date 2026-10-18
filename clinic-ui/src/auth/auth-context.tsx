import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authService } from "@/services/auth-service";

import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isInitializing: boolean;
  isAuthenticated: boolean;

  setSession: (user: AuthUser) => void;

  refreshUser: () => Promise<AuthUser | null>;

  hasRole: (role: string) => boolean;

  hasPermission: (permission: string) => boolean;

  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    authService.getUser(),
  );

  const [isInitializing, setIsInitializing] = useState(true);

  const setSession = useCallback((sessionUser: AuthUser) => {
    setUser(sessionUser);
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      return null;
    }

    try {
      const currentUser = await authService.getCurrentUser();

      setUser(currentUser);

      return currentUser;
    } catch (error) {
      console.error("Unable to restore SamaRoot session.", error);

      /*
       * A 401 means the token is no longer valid.
       * apiClient should ideally normalize this.
       */
      if (!authService.isAuthenticated()) {
        setUser(null);
      }

      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        await refreshUser();
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  const hasRole = useCallback(
    (role: string) => {
      const normalize = (value: string) =>
        value
          .trim()
          .toUpperCase()
          .replace(/[\s-]+/g, "_");
      const requestedRole = normalize(role);
      const aliases: Record<string, string[]> = {
        SUPER_ADMIN: ["SUPER_ADMINISTRATOR"],
        CLINIC_ADMIN: ["CLINIC_ADMINISTRATOR"],
      };
      const accepted = [requestedRole, ...(aliases[requestedRole] ?? [])];
      const assignedRoles = [user?.role, ...(user?.roles ?? [])].flatMap(
        (assigned) => {
          if (typeof assigned === "string") return [normalize(assigned)];
          if (assigned && typeof assigned === "object") {
            return [assigned.code, assigned.name]
              .filter((value): value is string => typeof value === "string")
              .map(normalize);
          }
          return [];
        },
      );
      return accepted.some((value) => assignedRoles.includes(value));
    },
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => {
      return Boolean(user?.permissions.includes(permission));
    },
    [user],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Unable to record logout in audit trail.", error);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading: isInitializing,
      isInitializing,
      isAuthenticated: Boolean(user),
      setSession,
      refreshUser,
      hasRole,
      hasPermission,
      logout,
    }),
    [
      user,
      isInitializing,
      setSession,
      refreshUser,
      hasRole,
      hasPermission,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
