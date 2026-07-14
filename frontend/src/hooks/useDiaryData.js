import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as restaurantsApi from "../api/restaurants";
import * as entriesApi from "../api/entries";
import * as usersApi from "../api/users";

export function useRestaurantLists(options = {}) {
  return useQuery({
    queryKey: ["restaurants", "mine"],
    queryFn: restaurantsApi.GetRestaurantLists,
    ...options,
  });
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: () => restaurantsApi.getRestaurantById(id),
    enabled: Boolean(id),
  });
}

export function useEntries(restaurantId) {
  return useQuery({
    queryKey: ["entries", restaurantId],
    queryFn: () => entriesApi.getEntries(restaurantId),
    enabled: Boolean(restaurantId),
  });
}

export function useAllEntries() {
  return useQuery({
    queryKey: ["entries", "all"],
    queryFn: () => entriesApi.getEntries(),
  });
}

export function useRecentEntries(limit = 20) {
  return useQuery({
    queryKey: ["entries", "recent", limit],
    queryFn: () => entriesApi.getRecentEntries(limit),
  });
}

export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.createRestaurant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["restaurants"] }),
  });
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => restaurantsApi.updateRestaurant(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", variables.id] });
    },
  });
}

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restaurantsApi.deleteRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useUsers(options = {}) {
  return useQuery({
    queryKey: ["users"],
    queryFn: usersApi.getUsers,
    ...options,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entriesApi.createEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] }); // visit counts change
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => entriesApi.updateEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: entriesApi.deleteEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}
