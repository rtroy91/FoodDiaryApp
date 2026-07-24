import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, MapPin, Store, X } from "lucide-react";
import { useCreateRestaurant, useUpdateRestaurant } from "../hooks/useDiaryData";
import { uploadPhoto } from "../api/entries";
import { useBataanCities, useBarangaysByCity } from "../hooks/usePsgc";
import { BATAAN_PROVINCE_NAME } from "../api/psgc";
import { FormInput } from "./FormInput";
import { RestaurantLocationPicker } from "./RestaurantLocationPicker";
import { SelectInput } from "./SelectInput";

const BATAAN_CENTER = { lat: 14.676, lon: 120.536 };
const WEEK_DAYS = [
  { day: 1, label: "Monday", short: "Mon" },
  { day: 2, label: "Tuesday", short: "Tue" },
  { day: 3, label: "Wednesday", short: "Wed" },
  { day: 4, label: "Thursday", short: "Thu" },
  { day: 5, label: "Friday", short: "Fri" },
  { day: 6, label: "Saturday", short: "Sat" },
  { day: 7, label: "Sunday", short: "Sun" },
];
const BUDGET_OPTIONS = [
  {
    value: "Budget / Tipid (Under \u20B1150)",
    label: "Budget / Tipid (Under \u20B1150)",
  },
  {
    value: "Mid-Range / Sakto (\u20B1150 - \u20B1500)",
    label: "Mid-Range / Sakto (\u20B1150 - \u20B1500)",
  },
  {
    value: "Upscale / Medyo Mahal (\u20B1500 - \u20B11,500)",
    label: "Upscale / Medyo Mahal (\u20B1500 - \u20B11,500)",
  },
  {
    value: "Luxury / Splurge (Over \u20B11,500)",
    label: "Luxury / Splurge (Over \u20B11,500)",
  },
];

function PhotoIconUpload({ label, preview, inputRef, icon: Icon, onChange }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-[#8C7B6A]">{label}</p>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] text-[#E89951] transition hover:border-[#E89951] hover:bg-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-[#E89951]/25"
        aria-label={`Upload ${label.toLowerCase()}`}
        title={`Upload ${label.toLowerCase()}`}
      >
        {preview ? (
          <img src={preview} alt="" width="320" height="192" className="h-full w-full object-cover" />
        ) : (
          <Icon size={28} aria-hidden="true" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        name={`${label.toLowerCase().replaceAll(" ", "-")}-upload`}
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </div>
  );
}

function createOpeningHours() {
  return WEEK_DAYS.map(({ day }) => ({ day, open: null, close: null }));
}

function normalizeLocationText(value) {
  return (value ?? "")
    .toLowerCase()
    .replace(/\bcity\b|\bmunicipality\b|\bof\b|\bbrgy\b|\bbarangay\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findBestLocationMatch(value, options) {
  const normalizedValue = normalizeLocationText(value);
  if (!normalizedValue) return "";

  return (
    options.find((option) => {
      const normalizedOption = normalizeLocationText(option);
      return (
        normalizedValue === normalizedOption ||
        normalizedValue.includes(normalizedOption) ||
        normalizedOption.includes(normalizedValue)
      );
    }) ?? ""
  );
}

function getAddressParts(result) {
  const address = result?.address ?? {};
  return {
    city: address.city ?? address.town ?? address.municipality ?? address.county ?? "",
    barangay: address.suburb ?? address.neighbourhood ?? address.quarter ?? address.village ?? address.hamlet ?? "",
  };
}

export function RestaurantForm({ restaurant, onClose }) {
  const navigate = useNavigate();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const menuPhotoInputRef = useRef(null);
  const storePhotoInputRef = useRef(null);
  const isEditing = Boolean(restaurant?.id);

  const { data: cities = [], isLoading: loadingCities, isError: citiesError } = useBataanCities();

  const [form, setForm] = useState({
    name: restaurant?.name ?? "",
    address: restaurant?.address ?? "",
    cityCode: "",
    cityName: restaurant?.city ?? "",
    barangay: restaurant?.barangay ?? "",
    category: restaurant?.category ?? "",
    promo: restaurant?.promo ?? "",
    openingHours: restaurant?.openingHours?.length ? restaurant.openingHours : createOpeningHours(),
    budget: restaurant?.budget ?? "",
    latitude: restaurant?.latitude ?? null,
    longitude: restaurant?.longitude ?? null,
  });
  const [menuPhotoFile, setMenuPhotoFile] = useState(null);
  const [menuPhotoPreview, setMenuPhotoPreview] = useState(restaurant?.menuPhotoUrl ?? null);
  const [storePhotoFile, setStorePhotoFile] = useState(null);
  const [storePhotoPreview, setStorePhotoPreview] = useState(restaurant?.storePhotoUrl ?? null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState([]);
  const [locationStatus, setLocationStatus] = useState("");
  const [pinLocation, setPinLocation] = useState(BATAAN_CENTER);
  const [pendingBarangay, setPendingBarangay] = useState("");

  const matchedCity = useMemo(() => {
    if (form.cityCode) {
      return cities.find((item) => item.code === form.cityCode) ?? null;
    }

    if (!isEditing || !form.cityName || !cities.length) {
      return null;
    }

    return cities.find((item) => normalizeLocationText(item.name) === normalizeLocationText(form.cityName)) ?? null;
  }, [cities, form.cityCode, form.cityName, isEditing]);

  const resolvedCityCode = form.cityCode || matchedCity?.code || "";

  const { data: barangays = [], isLoading: loadingBarangays } = useBarangaysByCity(resolvedCityCode);

  const cityOptions = useMemo(
    () =>
      [...cities]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((city) => ({
          value: city.code,
          label: city.name,
        })),
    [cities]
  );

  const barangayOptions = useMemo(
    () =>
      [...barangays]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((brgy) => ({
          value: brgy.name,
          label: brgy.name,
        })),
    [barangays]
  );

  const resolvedBarangay = useMemo(() => {
    if (form.barangay) return form.barangay;
    if (!pendingBarangay || !barangays.length) return "";

    return findBestLocationMatch(
      pendingBarangay,
      barangays.map((item) => item.name)
    );
  }, [barangays, form.barangay, pendingBarangay]);

  useEffect(() => {
    return () => {
      if (menuPhotoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(menuPhotoPreview);
      }
    };
  }, [menuPhotoPreview]);

  useEffect(() => {
    return () => {
      if (storePhotoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(storePhotoPreview);
      }
    };
  }, [storePhotoPreview]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  }

  function handleNextStep() {
    if (!form.name.trim() || !resolvedCityCode || !resolvedBarangay) {
      setErrorMessage("Add the place name, city, and barangay to continue.");
      return;
    }

    setErrorMessage(null);
    setCurrentStep(1);
  }

  function handleOpeningDayToggle(day, isOpen) {
    setForm((prev) => {
      const openingHours = prev.openingHours.map((item) =>
        item.day === day
          ? {
              ...item,
              open: isOpen ? (item.open ?? "09:00") : null,
              close: isOpen ? (item.close ?? "18:00") : null,
            }
          : item
      );

      return { ...prev, openingHours };
    });
  }

  function handleOpeningTimeChange(day, field, value) {
    setForm((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((item) => (item.day === day ? { ...item, [field]: value || null } : item)),
    }));
  }

  function handlePhotoChange(kind, file) {
    if (!file) return;

    const preview = URL.createObjectURL(file);

    if (kind === "menu") {
      setMenuPhotoFile(file);
      setMenuPhotoPreview(preview);
      return;
    }

    setStorePhotoFile(file);
    setStorePhotoPreview(preview);
  }

  function handleCityChange(code) {
    const city = cities.find((item) => item.code === code);

    setForm((prev) => ({
      ...prev,
      cityCode: code,
      cityName: city?.name ?? "",
      barangay: "",
    }));
    setPendingBarangay("");
  }

  function handleBarangayChange(value) {
    setPendingBarangay("");
    handleChange("barangay", value);
  }

  function applyPinnedLocation(result) {
    const { city, barangay } = getAddressParts(result);
    const cityMatch = findBestLocationMatch(
      city,
      cities.map((item) => item.name)
    );

    setForm((prev) => ({
      ...prev,
      address: result.display_name ?? prev.address,
      cityCode: cityMatch ? (cities.find((item) => item.name === cityMatch)?.code ?? prev.cityCode) : prev.cityCode,
      cityName: cityMatch || prev.cityName,
      barangay: "",
      latitude: result.lat ? Number(result.lat) : prev.latitude,
      longitude: result.lon ? Number(result.lon) : prev.longitude,
    }));

    setPendingBarangay(barangay);
    setShowPinModal(false);
  }

  async function reverseGeocodePin(location) {
    const params = new URLSearchParams({
      lat: String(location.lat),
      lon: String(location.lon),
      format: "jsonv2",
      addressdetails: "1",
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);

    return response.json();
  }

  async function confirmPinnedLocation() {
    setLocationStatus("Reading pinned address…");

    try {
      const result = await reverseGeocodePin(pinLocation);

      if (!result?.display_name) {
        setLocationStatus("Could not read an address from this pin.");
        return;
      }

      applyPinnedLocation({
        ...result,
        lat: String(pinLocation.lat),
        lon: String(pinLocation.lon),
      });
      setLocationStatus("");
    } catch {
      setLocationStatus("Could not read this pinned address.");
    }
  }

  async function searchPinnedLocation(e) {
    e?.preventDefault();
    if (!locationSearch.trim()) return;

    setLocationStatus("Searching…");
    setLocationResults([]);

    try {
      const params = new URLSearchParams({
        q: `${locationSearch}, Bataan, Philippines`,
        format: "jsonv2",
        addressdetails: "1",
        limit: "5",
        countrycodes: "ph",
      });

      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
      const data = await response.json();
      setLocationResults(Array.isArray(data) ? data : []);
      setLocationStatus(data?.length ? "" : "No matching location found.");
    } catch {
      setLocationStatus("Could not search the map right now.");
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not available in this browser.");
      return;
    }

    setLocationStatus("Finding your location…");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            format: "jsonv2",
            addressdetails: "1",
          });

          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
          const data = await response.json();
          if (data?.display_name) {
            setPinLocation({
              lat: Number(coords.latitude),
              lon: Number(coords.longitude),
            });
            setLocationResults([data]);
          } else {
            setLocationResults([]);
          }
          setLocationStatus(data?.display_name ? "" : "No address found.");
        } catch {
          setLocationStatus("Could not read this location.");
        }
      },
      () => setLocationStatus("Allow location access to pin your spot."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const [menuPhotoUrl, storePhotoUrl] = await Promise.all([
        menuPhotoFile ? uploadPhoto(menuPhotoFile, "store-menu") : null,
        storePhotoFile ? uploadPhoto(storePhotoFile, "store-icon") : null,
      ]);

      const payload = {
        name: form.name,
        address: form.address,
        barangay: resolvedBarangay,
        city: form.cityName || matchedCity?.name || "",
        province: BATAAN_PROVINCE_NAME,
        category: form.category,
        menuPhotoUrl: menuPhotoUrl ?? restaurant?.menuPhotoUrl ?? null,
        storePhotoUrl: storePhotoUrl ?? restaurant?.storePhotoUrl ?? null,
        promo: form.promo,
        openingHours: form.openingHours,
        budget: form.budget,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      const savedRestaurant = isEditing
        ? await updateRestaurant.mutateAsync({
            id: restaurant.id,
            payload,
          })
        : await createRestaurant.mutateAsync(payload);

      onClose?.();
      if (!isEditing) {
        navigate(`/place-details/${savedRestaurant.id}`);
      }
    } catch {
      setErrorMessage("Could not save this place. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl bg-white shadow-[0_8px_40px_rgba(28,17,7,0.12)]">
      <div className="flex items-center justify-between border-b border-[#F0EAE0] px-6 py-5">
        <h2
          id="restaurant-form-title"
          className="text-xl font-semibold text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          {isEditing ? "Edit place" : "Add a new place"}
        </h2>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-[#F5F0E8] hover:text-[#1C1107]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <div className="flex items-center gap-2" role="list" aria-label="Form progress">
          {["Place Details", "Directory Extras"].map((step, index) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full ${index <= currentStep ? "bg-[#E04B39]" : "bg-[#E8DFC8]"}`}
              role="listitem"
              aria-current={index === currentStep ? "step" : undefined}
              title={step}
            />
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8C7B6A]">
          Step {currentStep + 1} of 2 - {currentStep === 0 ? "Place Details" : "Directory Extras"}
        </p>

        {currentStep === 0 ? (
          <>
            <FormInput
              label="Place Name"
              id="restaurant-name"
              name="name"
              value={form.name}
              onChange={(value) => handleChange("name", value)}
              placeholder="e.g. Jollibee Balanga…"
              autoComplete="organization"
              required
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="restaurant-address"
                  className="text-[11px] font-semibold uppercase tracking-widest text-[#7A6A54]"
                >
                  Address
                </label>
              </div>
              <div className="flex rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] transition focus-within:border-[#E89951]">
                <input
                  id="restaurant-address"
                  name="address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street, building, landmark…"
                  autoComplete="street-address"
                  className="min-w-0 flex-1 rounded-l-2xl bg-transparent px-4 py-3 text-sm text-[#1C1107] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPinModal(true)}
                  className="flex w-12 shrink-0 items-center justify-center rounded-r-2xl text-[#E89951] transition hover:bg-[#F5F0E8]"
                  aria-label="Pin location"
                  title="Pin location"
                >
                  <MapPin size={17} />
                </button>
              </div>
              {form.latitude && form.longitude && (
                <p className="mt-1 text-[10px] text-stone-500">
                  Pinned at {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                </p>
              )}
            </div>

            <FormInput
              label="Province"
              id="restaurant-province"
              name="province"
              value={BATAAN_PROVINCE_NAME}
              readOnly
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <SelectInput
                  label="City / Municipality"
                  id="restaurant-city"
                  name="cityCode"
                  value={resolvedCityCode}
                  onChange={handleCityChange}
                  required
                  disabled={loadingCities || citiesError}
                  placeholder={loadingCities ? "Loading…" : "Select city"}
                  options={cityOptions}
                />
                {citiesError && <p className="mt-1 text-[10px] text-[#E04B39]">Couldn't load cities.</p>}
              </div>

              <SelectInput
                label="Barangay"
                id="restaurant-barangay"
                name="barangay"
                value={resolvedBarangay}
                onChange={handleBarangayChange}
                required
                disabled={!resolvedCityCode || loadingBarangays}
                placeholder={loadingBarangays ? "Loading…" : "Select barangay"}
                options={barangayOptions}
              />
            </div>

            <FormInput
              label="Category"
              id="restaurant-category"
              name="category"
              value={form.category}
              onChange={(value) => handleChange("category", value)}
              placeholder="e.g. Fast food…"
              autoComplete="off"
            />
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <PhotoIconUpload
                label="Menu photo"
                preview={menuPhotoPreview}
                inputRef={menuPhotoInputRef}
                icon={ImageIcon}
                onChange={(file) => handlePhotoChange("menu", file)}
              />
              <PhotoIconUpload
                label="Store picture"
                preview={storePhotoPreview}
                inputRef={storePhotoInputRef}
                icon={Store}
                onChange={(file) => handlePhotoChange("store", file)}
              />
            </div>

            <FormInput
              label="Promo"
              id="restaurant-promo"
              name="promo"
              value={form.promo}
              onChange={(value) => handleChange("promo", value)}
              placeholder="e.g. Free fries today…"
              autoComplete="off"
            />

            <div className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] p-4">
              <p className="mb-3 text-xs font-medium uppercase text-[#8C7B6A]">Opening Hours</p>
              <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                {WEEK_DAYS.map(({ day, label, short }) => {
                  const hours = form.openingHours.find((item) => item.day === day);
                  const isOpen = Boolean(hours?.open || hours?.close);

                  return (
                    <label
                      key={day}
                      className="grid gap-2 rounded-xl border border-[#E8DFC8] bg-white/70 px-3 py-2 text-xs font-semibold text-[#1C1107] sm:grid-cols-[5rem_1fr_1fr] sm:items-center"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name={`opening-day-${day}`}
                          checked={isOpen}
                          onChange={(e) => handleOpeningDayToggle(day, e.target.checked)}
                          className="h-4 w-4 rounded border-[#D8CDBB] accent-[#E04B39]"
                        />
                        <span title={label}>{short}</span>
                      </span>
                      <input
                        type="time"
                        name={`opening-time-${day}`}
                        value={hours?.open ?? ""}
                        onChange={(e) => handleOpeningTimeChange(day, "open", e.target.value)}
                        disabled={!isOpen}
                        className="min-w-0 rounded-xl border border-[#D8CDBB] bg-[#F5EEE4] px-3 py-2 text-sm text-[#1F1B16] outline-none transition focus:border-[#E04B39]/20 focus:ring-2 focus:ring-[#E04B39]/20 disabled:opacity-45"
                        aria-label={`${label} opening time`}
                      />
                      <input
                        type="time"
                        name={`closing-time-${day}`}
                        value={hours?.close ?? ""}
                        onChange={(e) => handleOpeningTimeChange(day, "close", e.target.value)}
                        disabled={!isOpen}
                        className="min-w-0 rounded-xl border border-[#D8CDBB] bg-[#F5EEE4] px-3 py-2 text-sm text-[#1F1B16] outline-none transition focus:border-[#E04B39]/20 focus:ring-2 focus:ring-[#E04B39]/20 disabled:opacity-45"
                        aria-label={`${label} closing time`}
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <SelectInput
              label="Budget"
              id="restaurant-budget"
              name="budget"
              value={form.budget}
              onChange={(value) => handleChange("budget", value)}
              placeholder="Select budget range"
              options={BUDGET_OPTIONS}
            />
          </>
        )}

        {errorMessage && (
          <div
            className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-xs text-[#C44A3C]"
            role="alert"
          >
            {errorMessage}
          </div>
        )}

        {currentStep === 0 ? (
          <button
            type="button"
            onClick={handleNextStep}
            disabled={loadingCities || loadingBarangays}
            className="w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Continue
          </button>
        ) : (
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              disabled={isSaving || createRestaurant.isPending || updateRestaurant.isPending}
              className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] py-3.5 text-sm font-semibold text-[#5A4A34] transition hover:bg-[#F5F0E8] disabled:cursor-not-allowed disabled:opacity-70"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={
                isSaving ||
                createRestaurant.isPending ||
                updateRestaurant.isPending ||
                loadingCities ||
                loadingBarangays
              }
              className="rounded-2xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving || createRestaurant.isPending || updateRestaurant.isPending
                ? "Saving…"
                : isEditing
                  ? "Save Changes"
                  : "Add Place"}
            </button>
          </div>
        )}
      </form>

      {showPinModal && (
        <RestaurantLocationPicker
          onClose={() => setShowPinModal(false)}
          locationSearch={locationSearch}
          onLocationSearchChange={setLocationSearch}
          onSearch={searchPinnedLocation}
          onUseCurrentLocation={useCurrentLocation}
          pinLocation={pinLocation}
          onMovePin={setPinLocation}
          onConfirm={confirmPinnedLocation}
          locationStatus={locationStatus}
          locationResults={locationResults}
          onSelectResult={(result) => {
            setPinLocation({
              lat: Number(result.lat),
              lon: Number(result.lon),
            });
            setLocationStatus("");
          }}
        />
      )}
    </div>
  );
}
