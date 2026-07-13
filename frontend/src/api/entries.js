import { apiClient } from "./client";

export async function getEntries(restaurantId) {
  const { data } = await apiClient.get("/entries", {
    params: restaurantId ? { restaurantId } : {},
  });
  return data;
}

export async function getRecentEntries(limit = 20) {
  const { data } = await apiClient.get("/entries/recent-entries", {
    params: { limit },
  });
  return data;
}

export async function createEntry(payload) {
  const { data } = await apiClient.post("/entries", payload);
  return data;
}

export async function updateEntry(id, payload) {
  const { data } = await apiClient.put(`/entries/${id}`, payload);
  return data;
}

export async function deleteEntry(id) {
  await apiClient.delete(`/entries/${id}`);
}

// Upload the image to the backend, which stores the file and returns its public URL.
export async function uploadPhoto(file, uploadFolder = "entry-photos") {
  const formData = new FormData();
  formData.append("photo", file);

  const { data } = await apiClient.post("/photos/upload", formData, {
    params: { uploadFolder },
  });
  return data.photoUrl;
}
