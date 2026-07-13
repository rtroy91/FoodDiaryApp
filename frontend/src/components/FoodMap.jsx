import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { categoryLabel } from "../utils/restaurants";

const BATAAN_CENTER = [14.676, 120.536];
const DEFAULT_ZOOM = 10;

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? "Brgy. " + restaurant.barangay : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function makePinIcon(isSelected) {
  const size = isSelected ? 38 : 30;
  const pinColor = isSelected ? "#E04B39" : "#1C1107";
  const ringColor = isSelected ? "#F0E76F" : "#A5CF83";

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    html: `
      <span style="
        display:block;
        width:${size}px;
        height:${size}px;
        border-radius:999px 999px 999px 4px;
        background:${pinColor};
        border:4px solid ${ringColor};
        box-shadow:0 10px 22px rgba(28,17,7,0.28);
        transform:rotate(-45deg);
      ">
        <span style="
          display:block;
          width:8px;
          height:8px;
          margin:${isSelected ? 11 : 7}px auto 0;
          border-radius:999px;
          background:#FFFBF4;
        "></span>
      </span>
    `,
  });
}

function MapViewport({ restaurants, selectedRestaurant }) {
  const map = useMap();

  useEffect(() => {
    if (selectedRestaurant?.latitude && selectedRestaurant?.longitude) {
      map.flyTo(
        [selectedRestaurant.latitude, selectedRestaurant.longitude],
        15,
        {
          duration: 0.6,
        },
      );
      return;
    }

    const points = restaurants.map((restaurant) => [
      restaurant.latitude,
      restaurant.longitude,
    ]);

    if (points.length === 0) {
      map.setView(BATAAN_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(points, { padding: [32, 32], maxZoom: 13 });
  }, [map, restaurants, selectedRestaurant]);

  return null;
}

function RestaurantMarker({ restaurant, isSelected, onSelect }) {
  const icon = useMemo(() => makePinIcon(isSelected), [isSelected]);
  const location = getLocation(restaurant);

  return (
    <Marker
      position={[restaurant.latitude, restaurant.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(restaurant.id),
      }}
    >
      <Popup>
        <div className="min-w-44 max-w-52 rounded-2xl bg-white px-4 py-2 text-center">
          <span className="mb-1 inline-flex rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
            {categoryLabel(restaurant.category)}
          </span>

          <p className="my-2! text-xl font-semibold leading-snug text-warmGray-900">
            {restaurant.name}
          </p>

          {restaurant.address && (
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-medium leading-snug text-[#6F7892]">
              {restaurant.address}
            </p>
          )}

          {location && (
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-medium leading-snug text-[#6F7892]">
              {location}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export function FoodMap({
  restaurants,
  selectedRestaurantId,
  onSelectRestaurant,
}) {
  const pinnedRestaurants = useMemo(
    () =>
      restaurants.filter(
        (restaurant) => restaurant.latitude && restaurant.longitude,
      ),
    [restaurants],
  );
  const selectedRestaurant = useMemo(
    () =>
      pinnedRestaurants.find(
        (restaurant) => restaurant.id === selectedRestaurantId,
      ),
    [pinnedRestaurants, selectedRestaurantId],
  );

  return (
    <MapContainer
      center={BATAAN_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="mx-auto h-full min-h-90 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport
        restaurants={pinnedRestaurants}
        selectedRestaurant={selectedRestaurant}
      />
      {pinnedRestaurants.map((restaurant) => (
        <RestaurantMarker
          key={restaurant.id}
          restaurant={restaurant}
          isSelected={restaurant.id === selectedRestaurantId}
          onSelect={onSelectRestaurant}
        />
      ))}
    </MapContainer>
  );
}
