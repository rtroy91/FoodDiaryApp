import { apiClient } from "./client";
import { clearAuthStorage, getStoredUser, setStoredUser } from "./authStorage";
import { queryClient } from "../lib/queryClient";

const DISPLAY_NAME_MAX_LENGTH = 15;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeDisplayName(displayName) {
  return displayName.trim();
}

function storeAuthSession(data) {
  queryClient.clear();
  clearAuthStorage();
  setStoredUser({
    email: data.email,
    displayName: data.displayName,
    role: data.role,
  });
}

export async function login(email, password) {
  const { data } = await apiClient.post("/auth/login", { email: normalizeEmail(email), password });
  storeAuthSession(data);
  return data;
}

export async function register(email, password, displayName) {
  const normalizedDisplayName = normalizeDisplayName(displayName);

  if (normalizedDisplayName.length > DISPLAY_NAME_MAX_LENGTH) {
    throw new Error("Display name is too long.");
  }

  const { data } = await apiClient.post("/auth/register", {
    email: normalizeEmail(email),
    password,
    displayName: normalizedDisplayName,
  });
  storeAuthSession(data);
  return data;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    queryClient.clear();
    clearAuthStorage();
  }
}

export function clearLocalSession() {
  queryClient.clear();
  clearAuthStorage();
}

export function isAuthenticated() {
  return Boolean(getStoredUser());
}

export function getCurrentUser() {
  return getStoredUser();
}

export function isAdmin() {
  return getStoredUser()?.role === "Admin";
}
