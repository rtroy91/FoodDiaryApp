import { apiClient } from './client';

export async function GetRestaurantLists() {
  const { data } = await apiClient.get('/restaurants/restaurant-lists');
  return data;
}

export async function getNearbyRestaurants({ lat, lng, radiusKm = 5 }) {
  const { data } = await apiClient.get('/restaurants/nearby', {
    params: { lat, lng, radiusKm }
  });
  return data;
}

export async function getMostVisited(limit = 10) {
  const { data } = await apiClient.get('/restaurants/most-visited', {
    params: { limit }
  });
  return data;
}

export async function getRestaurantById(id) {
  const { data } = await apiClient.get(`/restaurants/${id}`);
  return data;
}

export async function createRestaurant(payload) {
  const { data } = await apiClient.post('/restaurants', payload);
  return data;
}

export async function deleteRestaurant(id) {
  await apiClient.delete(`/restaurants/${id}`);
}
