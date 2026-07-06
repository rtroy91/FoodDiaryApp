import { useQuery } from "@tanstack/react-query";
import { getCitiesOfBataan, getBarangaysByCity } from "../api/psgc";

export function useBataanCities() {
  return useQuery({
    queryKey: ["psgc", "bataan-cities"],
    queryFn: getCitiesOfBataan,
    staleTime: Infinity,
  });
}

export function useBarangaysByCity(cityCode) {
  return useQuery({
    queryKey: ["psgc", "barangays", cityCode],
    queryFn: () => getBarangaysByCity(cityCode),
    enabled: Boolean(cityCode),
    staleTime: Infinity,
  });
}
