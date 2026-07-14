import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { categoryLabel } from "../utils/restaurants";

const BATAAN_CENTER = [14.676, 120.536];
const DEFAULT_ZOOM = 10;

function formatReach(value = 0) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return value.toString();
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
      map.flyTo([selectedRestaurant.latitude, selectedRestaurant.longitude], 15, {
        duration: 0.6,
      });
      return;
    }

    const points = restaurants.map((restaurant) => [restaurant.latitude, restaurant.longitude]);

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
  const markerRef = useRef(null);
  const icon = useMemo(() => makePinIcon(isSelected), [isSelected]);
  const rating = restaurant.averageRating;
  const visitCount = restaurant.visitCount ?? 0;
  const visitsLabel = `${formatReach(visitCount)} ${visitCount === 1 ? "visit" : "visits"}`;

  useEffect(() => {
    if (isSelected) {
      markerRef.current?.openPopup();
    }
  }, [isSelected]);

  return (
    <Marker
      ref={markerRef}
      position={[restaurant.latitude, restaurant.longitude]}
      icon={icon}
      title={restaurant.name}
      alt={`${restaurant.name} map marker`}
      eventHandlers={{
        click: () => onSelect(restaurant.id),
      }}
    >
      <Popup className="food-map-popup" closeButton={false}>
        <div className="w-56 overflow-hidden rounded-2xl  bg-[#FFFBF4] text-left">
          <div className="px-3.5 py-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="min-w-0 truncate text-base font-semibold leading-snug text-[#1C1107]">{restaurant.name}</p>
              <span className="shrink-0 rounded-full border border-[#F3D7AD] bg-[#FFF4DD] px-2 py-1 text-[9px] font-bold uppercase leading-none tracking-widest text-[#9A4B12]">
                {categoryLabel(restaurant.category)}
              </span>
            </div>

            <div className="-mt-1 flex items-center gap-2 text-xs font-semibold text-stone-600">
              <span
                className="inline-flex items-center gap-1 text-amber-700"
                aria-label={`Rating ${rating != null ? rating.toFixed(1) : "not rated"}`}
              >
                <Star size={12} fill="currentColor" aria-hidden="true" />
                {rating != null ? rating.toFixed(1) : "-"}
              </span>
              <span className="text-stone-300" aria-hidden="true">
                {"\u2022"}
              </span>
              <span className="text-[#365314]">{visitsLabel}</span>
            </div>

            <Link
              to={`/entries/place/${restaurant.id}`}
              onClick={() => onSelect(restaurant.id)}
              className="food-map-popup-action mt-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-[#E04B39] px-4 text-xs font-semibold text-white transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              View
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function FoodMap({ restaurants, selectedRestaurantId, onSelectRestaurant }) {
  const pinnedRestaurants = useMemo(
    () => restaurants.filter((restaurant) => restaurant.latitude && restaurant.longitude),
    [restaurants]
  );
  const selectedRestaurant = useMemo(
    () => pinnedRestaurants.find((restaurant) => restaurant.id === selectedRestaurantId),
    [pinnedRestaurants, selectedRestaurantId]
  );

  return (
    <MapContainer
      center={BATAAN_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom
      className="mx-auto h-full min-h-90 w-full"
      aria-label="Food places map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport restaurants={pinnedRestaurants} selectedRestaurant={selectedRestaurant} />
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
