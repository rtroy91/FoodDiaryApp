import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearLocalSession, getCurrentUser, onAuthSessionChanged, refreshCurrentUser } from "../api/auth";
import { queryClient } from "../lib/queryClient";

const AuthSessionContext = createContext(null);

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
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
