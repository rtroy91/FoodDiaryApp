import { apiClient } from "./client";

export async function getUsers() {
  const { data } = await apiClient.get("/users");
  return data;
}
