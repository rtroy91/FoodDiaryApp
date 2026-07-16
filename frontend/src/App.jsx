import { lazy } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { useAuthSession } from "./context/AuthSessionContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SessionLoadingState } from "./components/SessionLoadingState";
import { isAdmin } from "./api/auth";
import { FeaturedPage } from "./pages/FeaturedPage";
import { EntriesPage } from "./pages/EntriesPage";
import { FoodMapPage } from "./pages/FoodMapPage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { TopPlacePage } from "./pages/TopPlacePage";
import { FoodPlaceDetailPage } from "./pages/FoodPlaceDetailPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";

const RestaurantForm = lazy(() =>
  import("./components/RestaurantForm").then((module) => ({
    default: module.RestaurantForm,
  }))
);

function AdminRoute({ children }) {
  return isAdmin() ? children : <FeaturedPage />;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isChecking } = useAuthSession();

  if (isChecking) {
    return <SessionLoadingState />;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPasswordPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <NavBar />
            </ProtectedRoute>
          }
        >
          <Route index element={<FeaturedPage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entries/place/:restaurantId" element={<EntryDetailPage />} />
          <Route path="entries/:id" element={<EntryDetailPage />} />
          <Route path="food-map" element={<FoodMapPage />} />
          <Route path="top-places" element={<TopPlacePage />} />
          <Route
            path="add-restaurant"
            element={
              <AdminRoute>
                <RestaurantForm />
              </AdminRoute>
            }
          />
          <Route path="place-details/:id" element={<FoodPlaceDetailPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
