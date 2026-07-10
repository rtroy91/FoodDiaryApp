const TOKEN_KEY = "food_diary_token";
const USER_KEY = "food_diary_user";

let tokenCache;
let userCache;

function readStorage(key) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function removeStorage(key) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function getAuthToken() {
  if (tokenCache === undefined) {
    tokenCache = readStorage(TOKEN_KEY);
  }

  return tokenCache;
}

export function setAuthToken(token) {
  tokenCache = token;
  writeStorage(TOKEN_KEY, token);
}

export function clearAuthToken() {
  tokenCache = null;
  removeStorage(TOKEN_KEY);
}

export function getStoredUser() {
  if (userCache !== undefined) {
    return userCache;
  }

  const storedUser = readStorage(USER_KEY);
  if (!storedUser) {
    userCache = null;
    return null;
  }

  try {
    userCache = JSON.parse(storedUser);
    return userCache;
  } catch {
    userCache = null;
    removeStorage(USER_KEY);
    return null;
  }
}

export function setStoredUser(user) {
  userCache = user;
  writeStorage(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  userCache = null;
  removeStorage(USER_KEY);
}

export function clearAuthStorage() {
  clearAuthToken();
  clearStoredUser();
}
