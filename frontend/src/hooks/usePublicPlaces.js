import { useQuery } from '@tanstack/react-query';
import { getPublicPlacesInBataan } from '../api/places';

// Groups a flat list of places into nested { province: { city: { barangay: [places] } } }
function groupByLocation(places) {
  const grouped = {};

  for (const place of places) {
    grouped[place.province] ??= {};
    grouped[place.province][place.city] ??= {};
    grouped[place.province][place.city][place.barangay] ??= [];
    grouped[place.province][place.city][place.barangay].push(place);
  }

  return grouped;
}

export function usePublicPlaces() {
  const query = useQuery({
    queryKey: ['public-places', 'bataan'],
    queryFn: getPublicPlacesInBataan,
    staleTime: 30 * 60 * 1000 // OSM data doesn't change minute to minute
  });

  return {
    ...query,
    grouped: query.data ? groupByLocation(query.data) : null
  };
}
