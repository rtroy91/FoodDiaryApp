import { apiClient } from "./client";

export async function GetRestaurantLists() {
  const { data } = await apiClient.get("/restaurants/restaurant-lists");
  return data;
}

export async function getRestaurantOptions() {
  const { data } = await apiClient.get("/restaurants/options");
  return data;
}

export async function getRestaurantById(id) {
  const { data } = await apiClient.get(`/restaurants/${id}`);
  return data;
}

export async function createRestaurant(payload) {
  const { data } = await apiClient.post("/restaurants", payload);
  return data;
}

export async function updateRestaurant(id, payload) {
  const { data } = await apiClient.put(`/restaurants/${id}`, payload);
  return data;
}

export async function deleteRestaurant(id) {
  await apiClient.delete(`/restaurants/${id}`);
}
