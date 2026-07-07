import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as restaurantsApi from '../api/restaurants';
import * as entriesApi from '../api/entries';

export function useMostVisited(limit = 10) {
  return useQuery({
    queryKey: ['restaurants', 'most-visited', limit],
    queryFn: () => restaurantsApi.getMostVisited(limit)
  });
}

export function useRestaurantLists() {
  return useQuery({
    queryKey: ['restaurants', 'mine'],
    queryFn: restaurantsApi.GetRestaurantLists
  });
}

export function useNearbyRestaurants(coords, radiusKm = 5) {
  return useQuery({
    queryKey: ['restaurants', 'nearby', coords, radiusKm],
    queryFn: () => restaurantsApi.getNearbyRestaurants({ ...coords, radiusKm }),
    enabled: Boolean(coords?.lat && coords?.lng)
  });
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: ['restaurants', id],
    queryFn: () => restaurantsApi.getRestaurantById(id),
    enabled: Boolean(id)
  });
}

export function useEntries(restaurantId) {
  return useQuery({
    queryKey: ['entries', restaurantId],
    queryFn: () => entriesApi.getEntries(restaurantId),
    enabled: Boolean(restaurantId)
  });
}

export function useAllEntries() {
  return useQuery({
    queryKey: ['entries', 'all'],
    queryFn: () => entriesApi.getEntries()
  });
}

export function useRecentEntries(limit = 20) {
  return useQuery({
    queryKey: ['entries', 'recent', limit],
    queryFn: () => entriesApi.getRecentEntries(limit)
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.createRestaurant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurants'] })
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entriesApi.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] }); // visit counts change
    }
  });
}
