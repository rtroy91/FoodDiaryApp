import { apiClient } from "./client";

export async function GetRestaurantLists() {
  const { data } = await apiClient.get("/restaurants/restaurant-lists");
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
