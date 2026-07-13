import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";

const FeaturedPage = lazy(() =>
  import("./pages/FeaturedPage").then((module) => ({
    default: module.FeaturedPage,
  })),
);
const EntriesPage = lazy(() =>
  import("./pages/EntriesPage").then((module) => ({
    default: module.EntriesPage,
  })),
);
const FoodMapPage = lazy(() =>
  import("./pages/FoodMapPage").then((module) => ({
    default: module.FoodMapPage,
  })),
);
const EntryDetailPage = lazy(() =>
  import("./pages/EntryDetailPage").then((module) => ({
    default: module.EntryDetailPage,
  })),
);
const TopPlacePage = lazy(() =>
  import("./pages/TopPlacePage").then((module) => ({
    default: module.TopPlacePage,
  })),
);
const FoodPlaceDetailPage = lazy(() =>
  import("./pages/FoodPlaceDetailPage").then((module) => ({
    default: module.FoodPlaceDetailPage,
  })),
);
const AddRestaurantForm = lazy(() =>
  import("./components/AddRestaurantForm").then((module) => ({
    default: module.AddRestaurantForm,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  })),
);

function RouteLoadingShell() {
  return (
    <div
      className="min-h-dvh bg-[#F5F0E8]"
      style={{ fontFamily: '"Geist Mono", monospace' }}
    />
  );
}

function withRouteSuspense(element) {
  return <Suspense fallback={<RouteLoadingShell />}>{element}</Suspense>;
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
          <Route path="entries/:id" element={<EntryDetailPage />} />
          <Route path="food-map" element={<FoodMapPage />} />
          <Route path="top-places" element={<TopPlacePage />} />
          <Route path="add-restaurant" element={<AddRestaurantForm />} />
          <Route path="place-details/:id" element={<FoodPlaceDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
