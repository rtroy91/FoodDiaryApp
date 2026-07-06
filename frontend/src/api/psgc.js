import axios from 'axios';

const psgcClient = axios.create({
  baseURL: 'https://psgc.cloud/api/v2',
  timeout: 10000
});

export const BATAAN_PROVINCE_CODE = '0300800000';
export const BATAAN_PROVINCE_NAME = 'Bataan';

function normalizePsgcList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export async function getBataanCitiesMunicipalities() {
  const { data } = await psgcClient.get('/cities-municipalities', {
    params: {
      province_code: BATAAN_PROVINCE_CODE,
      per_page: 200
    }
  });
  return normalizePsgcList(data);
}

export async function getBarangaysByCity(cityOrMunicipalityCode) {
  if (!cityOrMunicipalityCode) return [];

  const { data } = await psgcClient.get(
    `/cities-municipalities/${cityOrMunicipalityCode}/barangays`,
    { params: { per_page: 200 } }
  );
  return normalizePsgcList(data);
}
