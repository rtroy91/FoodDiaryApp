import { apiClient } from "./client";
import { clearAuthStorage, getAuthToken, getStoredUser, setAuthToken, setStoredUser } from "./authStorage";

function storeAuthSession(data) {
  setAuthToken(data.token);
  setStoredUser({
    email: data.email,
    displayName: data.displayName,
    role: data.role,
  });
}

export async function login(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  storeAuthSession(data);
  return data;
}

export async function register(email, password, displayName) {
  const { data } = await apiClient.post("/auth/register", {
    email,
    password,
    displayName,
  });
  storeAuthSession(data);
  return data;
}

export function logout() {
  clearAuthStorage();
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function getCurrentUser() {
  return getStoredUser();
}

export function isAdmin() {
  return getStoredUser()?.role === "Admin";
}
