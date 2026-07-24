import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { useAuthSession } from "./context/AuthSessionContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SessionLoadingState } from "./components/SessionLoadingState";
import { isAdmin } from "./api/auth";

function lazyNamed(loader, exportName) {
  return lazy(() => loader().then((module) => ({ default: module[exportName] })));
}

const FeaturedPage = lazyNamed(() => import("./pages/FeaturedPage"), "FeaturedPage");
const EntriesPage = lazyNamed(() => import("./pages/EntriesPage"), "EntriesPage");
const FoodMapPage = lazyNamed(() => import("./pages/FoodMapPage"), "FoodMapPage");
const EntryDetailPage = lazyNamed(() => import("./pages/EntryDetailPage"), "EntryDetailPage");
const TopPlacePage = lazyNamed(() => import("./pages/TopPlacePage"), "TopPlacePage");
const FoodPlaceDetailPage = lazyNamed(() => import("./pages/FoodPlaceDetailPage"), "FoodPlaceDetailPage");
const AdminUsersPage = lazyNamed(() => import("./pages/AdminUsersPage"), "AdminUsersPage");
const ForgotPasswordPage = lazyNamed(() => import("./pages/ForgotPasswordPage"), "ForgotPasswordPage");
const LoginPage = lazyNamed(() => import("./pages/LoginPage"), "LoginPage");
const NotFoundPage = lazyNamed(() => import("./pages/NotFoundPage"), "NotFoundPage");
const RegisterPage = lazyNamed(() => import("./pages/RegisterPage"), "RegisterPage");
const ResetPasswordPage = lazyNamed(() => import("./pages/ResetPasswordPage"), "ResetPasswordPage");
const RestaurantForm = lazyNamed(() => import("./components/RestaurantForm"), "RestaurantForm");

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
      <Suspense fallback={<SessionLoadingState />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
