import { apiClient } from './client';

export async function getEntries(restaurantId) {
  const { data } = await apiClient.get('/entries', {
    params: restaurantId ? { restaurantId } : {}
  });
  return data;
}

export async function getRecentEntries(limit = 20) {
  const { data } = await apiClient.get('/entries/recent', { params: { limit } });
  return data;
}

export async function createEntry(payload) {
  const { data } = await apiClient.post('/entries', payload);
  return data;
}

export async function updateEntry(id, payload) {
  const { data } = await apiClient.put(`/entries/${id}`, payload);
  return data;
}

export async function deleteEntry(id) {
  await apiClient.delete(`/entries/${id}`);
}

// Two-step photo upload: get a pre-signed URL, PUT the file directly to blob storage.
export async function uploadPhoto(file) {
  const { data: uploadInfo } = await apiClient.post('/photos/upload-url', {
    fileName: file.name,
    contentType: file.type
  });

  await fetch(uploadInfo.uploadUrl, {
    method: 'PUT',
    headers: {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.type
    },
    body: file
  });

  return uploadInfo.publicUrl;
}
