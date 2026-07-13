import axios from "axios";

const psgcClient = axios.create({
  baseURL: "https://psgc.cloud/api/v2",
  timeout: 10000,
});

export const BATAAN_PROVINCE_NAME = "Bataan";

export async function getCitiesOfBataan() {
  const { data } = await psgcClient.get(`/provinces/${BATAAN_PROVINCE_NAME}/cities-municipalities`);

  return Array.isArray(data) ? data : data.data || [];
}

export async function getBarangaysByCity(cityOrMunicipalityCode) {
  if (!cityOrMunicipalityCode) return [];

  const { data } = await psgcClient.get(`/cities-municipalities/${cityOrMunicipalityCode}/barangays`);

  return Array.isArray(data) ? data : data.data || [];
}
