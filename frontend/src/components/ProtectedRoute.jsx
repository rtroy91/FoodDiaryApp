import { Navigate } from "react-router-dom";
import { useAuthSession } from "../context/AuthSessionContext";
import { ConnectionErrorState } from "./ConnectionErrorState";
import { SessionLoadingState } from "./SessionLoadingState";

export function ProtectedRoute({ children }) {
  const { hasConnectionError, isAuthenticated, isChecking } = useAuthSession();

  if (isChecking) {
    return <SessionLoadingState />;
  }

  if (hasConnectionError && !isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FFFBF4] px-5 py-8">
        <div className="mx-auto max-w-xl">
          <ConnectionErrorState />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
