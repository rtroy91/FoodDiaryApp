import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Attach the JWT (stored after login) to every outgoing request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('food_diary_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, send the user back to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute =
      window.location.pathname === '/login' ||
      window.location.pathname === '/register';

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('food_diary_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
