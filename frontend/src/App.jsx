import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { isAdmin } from "./api/auth";
import { FeaturedPage } from "./pages/FeaturedPage";
import { EntriesPage } from "./pages/EntriesPage";
import { FoodMapPage } from "./pages/FoodMapPage";
import { EntryDetailPage } from "./pages/EntryDetailPage";
import { TopPlacePage } from "./pages/TopPlacePage";
import { FoodPlaceDetailPage } from "./pages/FoodPlaceDetailPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

const RestaurantForm = lazy(() =>
  import("./components/RestaurantForm").then((module) => ({
    default: module.RestaurantForm,
  }))
);

function AdminRoute({ children }) {
  return isAdmin() ? children : <FeaturedPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
