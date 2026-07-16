import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearLocalSession, getCurrentUser, onAuthSessionChanged, refreshCurrentUser } from "../api/auth";
import { queryClient } from "../lib/queryClient";

const AuthSessionContext = createContext(null);
const AUTH_PAGE_PATHS = new Set(["/login", "/register", "/forgot-password", "/reset-password"]);

function isAuthPage() {
  if (typeof window === "undefined") return false;
  return AUTH_PAGE_PATHS.has(window.location.pathname);
}

function getInitialSessionStatus() {
  if (!isAuthPage()) return "checking";
  return getCurrentUser() ? "authenticated" : "unauthenticated";
}

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [status, setStatus] = useState(getInitialSessionStatus);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      if (isAuthPage()) {
        const storedUser = getCurrentUser();
        setUser(storedUser);
        setStatus(storedUser ? "authenticated" : "unauthenticated");
        return;
      }

      try {
        const currentUser = await refreshCurrentUser();

        if (!isMounted) return;
        setUser(currentUser);
        setStatus("authenticated");
        queryClient.invalidateQueries();
      } catch (error) {
        if (!isMounted) return;

        if (!error.response) {
          setUser(getCurrentUser());
          setStatus("connection-error");
          return;
        }

        if (error.response.status === 401) {
          clearLocalSession();
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        setUser(getCurrentUser());
        setStatus("connection-error");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return onAuthSessionChanged(() => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setStatus(currentUser ? "authenticated" : "unauthenticated");
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      isChecking: status === "checking",
      isAuthenticated: Boolean(user),
      hasConnectionError: status === "connection-error",
    }),
    [status, user]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthSessionContext);

  if (!context) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  }

  return context;
}
