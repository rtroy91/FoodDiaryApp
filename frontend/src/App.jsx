import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/HomePage";
import { EntriesPage } from "./pages/EntriesPage";

const DiscoverPage = lazy(() =>
  import("./pages/DiscoverPage").then((module) => ({
    default: module.DiscoverPage,
  })),
);
const EntryDetailPage = lazy(() =>
  import("./pages/EntryDetailPage").then((module) => ({
    default: module.EntryDetailPage,
  })),
);
const FoodPlacePage = lazy(() =>
  import("./pages/FoodPlacePage").then((module) => ({
    default: module.FoodPlacePage,
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
          <Route index element={<HomePage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entries/:id" element={<EntryDetailPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="food-places" element={<FoodPlacePage />} />
          <Route path="add-restaurant" element={<AddRestaurantForm />} />
          <Route path="place-details/:id" element={<FoodPlaceDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
