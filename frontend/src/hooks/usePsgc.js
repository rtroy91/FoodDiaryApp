import { useQuery } from '@tanstack/react-query';
import { getBataanCitiesMunicipalities, getBarangaysByCity } from '../api/psgc';

export function useBataanCities() {
  return useQuery({
    queryKey: ['psgc', 'bataan-cities'],
    queryFn: getBataanCitiesMunicipalities,
    staleTime: Infinity // this reference data never changes during a session
  });
}

export function useBarangaysByCity(cityCode) {
  return useQuery({
    queryKey: ['psgc', 'barangays', cityCode],
    queryFn: () => getBarangaysByCity(cityCode),
    enabled: Boolean(cityCode),
    staleTime: Infinity
  });
}
