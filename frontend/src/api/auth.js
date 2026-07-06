import { apiClient } from './client';

export async function login(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  localStorage.setItem('food_diary_token', data.token);
  return data;
}

export async function register(email, password, displayName) {
  const { data } = await apiClient.post('/auth/register', { email, password, displayName });
  localStorage.setItem('food_diary_token', data.token);
  return data;
}

export function logout() {
  localStorage.removeItem('food_diary_token');
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('food_diary_token'));
}
