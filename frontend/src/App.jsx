import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAdmin } from "./api/auth";

const FeaturedPage = lazy(() =>
  import("./pages/FeaturedPage").then((module) => ({
    default: module.FeaturedPage,
  }))
);
const EntriesPage = lazy(() =>
  import("./pages/EntriesPage").then((module) => ({
    default: module.EntriesPage,
  }))
);
const FoodMapPage = lazy(() =>
  import("./pages/FoodMapPage").then((module) => ({
    default: module.FoodMapPage,
  }))
);
const EntryDetailPage = lazy(() =>
  import("./pages/EntryDetailPage").then((module) => ({
    default: module.EntryDetailPage,
  }))
);
const TopPlacePage = lazy(() =>
  import("./pages/TopPlacePage").then((module) => ({
    default: module.TopPlacePage,
  }))
);
const FoodPlaceDetailPage = lazy(() =>
  import("./pages/FoodPlaceDetailPage").then((module) => ({
    default: module.FoodPlaceDetailPage,
  }))
);
const AdminUsersPage = lazy(() =>
  import("./pages/AdminUsersPage").then((module) => ({
    default: module.AdminUsersPage,
  }))
);
const RestaurantForm = lazy(() =>
  import("./components/RestaurantForm").then((module) => ({
    default: module.RestaurantForm,
  }))
);
const LoginPage = lazy(() => import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);

function RouteLoadingShell() {
  return <div className="min-h-dvh bg-[#F5F0E8]" style={{ fontFamily: '"Geist Mono", monospace' }} />;
}

function withRouteSuspense(element) {
  return <Suspense fallback={<RouteLoadingShell />}>{element}</Suspense>;
}

function AdminRoute({ children }) {
  return isAdmin() ? children : <FeaturedPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={withRouteSuspense(<LoginPage />)} />
        <Route path="/register" element={withRouteSuspense(<RegisterPage />)} />

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
      </Routes>
    </BrowserRouter>
  );
}
