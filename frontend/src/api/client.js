import axios from "axios";
import { clearAuthStorage } from "./authStorage";
import { queryClient } from "../lib/queryClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://localhost:5001/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// If the token is invalid/expired, send the user back to login.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = window.location.pathname === "/login" || window.location.pathname === "/register";

    if (error.response?.status === 401 && !isAuthRoute) {
      queryClient.clear();
      clearAuthStorage();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
