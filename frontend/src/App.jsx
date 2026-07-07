import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { EntriesPage } from './pages/EntriesPage';
import { MostVisitedPage } from './pages/MostVisitedPage';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage';
import { AddRestaurantForm } from './components/AddRestaurantForm';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

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
          <Route index element={<HomePage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="most-visited" element={<MostVisitedPage />} />
          <Route path="add-restaurant" element={<AddRestaurantForm />} />
          <Route path="restaurants/:id" element={<RestaurantDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
