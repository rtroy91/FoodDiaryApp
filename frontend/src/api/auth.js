import { apiClient } from "./client";
import { clearAuthStorage, getStoredUser, setStoredUser } from "./authStorage";
import { queryClient } from "../lib/queryClient";

const DISPLAY_NAME_MAX_LENGTH = 15;
const AUTH_SESSION_CHANGED_EVENT = "food-diary-auth-session-changed";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeDisplayName(displayName) {
  return displayName.trim();
}

function storeAuthSession(data, { clearCache = true } = {}) {
  if (clearCache) {
    queryClient.clear();
  }

  clearAuthStorage();
  setStoredUser({
    email: data.email,
    displayName: data.displayName,
    role: data.role,
  });
  notifyAuthSessionChanged();
}

function notifyAuthSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export async function login(email, password, rememberMe = false) {
  const { data } = await apiClient.post("/auth/login", { email: normalizeEmail(email), password, rememberMe });
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
    notifyAuthSessionChanged();
  }
}

export async function refreshCurrentUser() {
  const { data } = await apiClient.get("/auth/me");
  storeAuthSession(data, { clearCache: false });
  return data;
}

export function clearLocalSession() {
  queryClient.clear();
  clearAuthStorage();
  notifyAuthSessionChanged();
}

export function onAuthSessionChanged(callback) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, callback);
  return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, callback);
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
