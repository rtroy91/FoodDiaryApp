import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { LocateFixed, Search, X } from "lucide-react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Modal } from "./Modal";

const BATAAN_ZOOM = 10;

function makePinIcon() {
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    html: `
      <span style="
        display:block;
        width:38px;
        height:38px;
        border-radius:999px 999px 999px 4px;
        background:#E04B39;
        border:4px solid #F0E76F;
        box-shadow:0 10px 22px rgba(28,17,7,0.28);
        transform:rotate(-45deg);
      ">
        <span style="
          display:block;
          width:8px;
          height:8px;
          margin:11px auto 0;
          border-radius:999px;
          background:#FFFBF4;
        "></span>
      </span>
    `,
  });
}

function PinMapController({ pinLocation, onMovePin }) {
  const map = useMap();
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    map.flyTo([pinLocation.lat, pinLocation.lon], Math.max(map.getZoom(), 13), {
      duration: 0.45,
    });
  }, [map, pinLocation]);

  useMapEvents({
    click(event) {
      onMovePin({ lat: event.latlng.lat, lon: event.latlng.lng });
    },
  });

  return null;
}

function LocationPinMap({ pinLocation, onMovePin }) {
  const pinIcon = useMemo(() => makePinIcon(), []);

  return (
    <MapContainer
      center={[pinLocation.lat, pinLocation.lon]}
      zoom={BATAAN_ZOOM}
      scrollWheelZoom
      className="h-64 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <PinMapController pinLocation={pinLocation} onMovePin={onMovePin} />
      <Marker
        draggable
        position={[pinLocation.lat, pinLocation.lon]}
        icon={pinIcon}
        eventHandlers={{
          dragend(event) {
            const next = event.target.getLatLng();
            onMovePin({ lat: next.lat, lon: next.lng });
          },
        }}
      />
    </MapContainer>
  );
}

export function RestaurantLocationPicker({
  onClose,
  locationSearch,
  onLocationSearchChange,
  onSearch,
  onUseCurrentLocation,
  pinLocation,
  onMovePin,
  onConfirm,
  locationStatus,
  locationResults,
  onSelectResult,
}) {
  return (
    <Modal onClose={onClose} placement="center" ariaLabelledBy="pin-location-title" backdropClassName="z-60">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-[0_8px_40px_rgba(28,17,7,0.18)]">
        <div className="flex items-center justify-between border-b border-[#F0EAE0] px-5 py-4">
          <div>
            <h3
              id="pin-location-title"
              className="text-lg font-semibold text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Pin Location
            </h3>
            <p className="mt-0.5 text-xs text-stone-500">Move the pin, then use it to fill the location details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-[#F5F0E8] hover:text-[#1C1107] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/30"
            aria-label="Close pin location"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-4">
              <Search size={16} className="shrink-0 text-stone-400" aria-hidden="true" />
              <input
                name="locationSearch"
                value={locationSearch}
                onChange={(event) => onLocationSearchChange(event.target.value)}
                placeholder="Search a place or street…"
                aria-label="Search a place or street"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#1C1107] outline-none placeholder:text-stone-400"
              />
            </label>
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1C1107] px-4 text-xs font-semibold text-[#A5CF83]"
            >
              Search
            </button>
          </div>

          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] text-xs font-semibold text-[#1C1107]"
          >
            <LocateFixed size={15} aria-hidden="true" />
            Use Current Location
          </button>

          <div className="relative overflow-hidden rounded-2xl border border-[#E8DFC8] bg-[#F5F0E8]">
            <LocationPinMap pinLocation={pinLocation} onMovePin={onMovePin} />
            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-stone-600 shadow">
              Click the map or drag the pin
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] tabular-nums text-stone-500">
              {pinLocation.lat.toFixed(5)}, {pinLocation.lon.toFixed(5)}
            </p>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-[#E04B39] px-4 py-2.5 text-xs font-semibold text-white"
            >
              Use This Pin
            </button>
          </div>

          {locationStatus && (
            <p className="text-center text-xs text-stone-500" aria-live="polite">
              {locationStatus}
            </p>
          )}

          <div className="max-h-64 space-y-2 overflow-auto overscroll-contain">
            {locationResults.map((result) => (
              <button
                key={`${result.place_id}-${result.lat}-${result.lon}`}
                type="button"
                onClick={() => onSelectResult(result)}
                className="w-full rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-4 py-3 text-left transition-colors hover:border-[#E89951]"
              >
                <p className="text-sm font-semibold text-[#1C1107]">
                  {result.name || result.display_name?.split(",")[0]}
                </p>
                <p className="mt-1 break-words text-xs leading-snug text-stone-500">{result.display_name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
