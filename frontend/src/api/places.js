import axios from 'axios';

// OpenStreetMap Overpass API — free, public, no API key required.
// Docs: https://wiki.openstreetmap.org/wiki/Overpass_API
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Pulls every node tagged as a restaurant/fast-food/cafe/food-court inside
// the Bataan province boundary (matched by OSM admin boundary name).
const QUERY = `
[out:json][timeout:25];
area["name"="Bataan"]["admin_level"="5"]->.searchArea;
(
  node["amenity"~"^(restaurant|fast_food|cafe|food_court)$"](area.searchArea);
);
out body;
`;

export async function getPublicPlacesInBataan() {
  const { data } = await axios.get(OVERPASS_URL, {
    params: { data: QUERY }
  });

  return (data.elements || [])
    .filter((el) => el.tags?.name) // skip unnamed nodes, not useful in a list
    .map((el) => ({
      id: el.id,
      name: el.tags.name,
      category: el.tags.amenity,
      address: el.tags['addr:street'] || el.tags['addr:full'] || null,
      barangay: el.tags['addr:suburb'] || el.tags['addr:neighbourhood'] || 'Unspecified barangay',
      city: el.tags['addr:city'] || el.tags['addr:town'] || el.tags['addr:municipality'] || 'Unspecified city',
      province: el.tags['addr:province'] || el.tags['addr:state'] || 'Bataan',
      latitude: el.lat,
      longitude: el.lon
    }));
}
