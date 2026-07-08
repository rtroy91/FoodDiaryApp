import { apiClient } from "./client";

export async function login(email, password) {
  const { data } = await apiClient.post("/auth/login", { email, password });
  localStorage.setItem("food_diary_token", data.token);
  localStorage.setItem(
    "food_diary_user",
    JSON.stringify({
      email: data.email,
      displayName: data.displayName,
    }),
  );
  return data;
}

export async function register(email, password, displayName) {
  const { data } = await apiClient.post("/auth/register", {
    email,
    password,
    displayName,
  });
  localStorage.setItem("food_diary_token", data.token);
  localStorage.setItem(
    "food_diary_user",
    JSON.stringify({
      email: data.email,
      displayName: data.displayName,
    }),
  );
  return data;
}

export function logout() {
  localStorage.removeItem("food_diary_token");
  localStorage.removeItem("food_diary_user");
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("food_diary_token"));
}

export function getCurrentUser() {
  const storedUser = localStorage.getItem("food_diary_user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("food_diary_user");
    return null;
  }
}
