import { useMemo, useState } from "react";
import { MapPin, Search, UtensilsCrossed } from "lucide-react";
import { FoodMap } from "../components/FoodMap";
import { FoodCatalogCard } from "../components/FoodCatalogCard";
import { PageHeader } from "../components/PageHeader";
import { SelectInput } from "../components/SelectInput";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";
import { useBataanCities } from "../hooks/usePsgc";
import { buildPlaceStats, categoryLabel } from "../utils/restaurants";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1180px",
  width: "100%",
};

function getCityName(city) {
  return (
    city.name ?? city.cityMunicipalityName ?? city.fullName ?? city.code ?? ""
  );
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\bbrgy\.?\b/g, "barangay")
    .replace(/[_-]/g, " ")
    .replace(/[^\w\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function FoodMapPage() {
  const {
    data: restaurants = [],
    isLoading: isLoadingRestaurants,
    isError,
  } = useRestaurantLists();

  const { data: entries = [], isLoading: isLoadingEntries } = useAllEntries();
  const { data: bataanCities = [], isLoading: isLoadingCities } =
    useBataanCities();
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const places = useMemo(
    () => buildPlaceStats(restaurants, entries),
    [restaurants, entries],
  );

  const cityOptions = useMemo(
    () =>
      bataanCities
        .map((city) => {
          const name = getCityName(city);
          return { value: name, label: name };
        })
        .filter((city) => city.value)
        .sort((a, b) => a.label.localeCompare(b.label)),
    [bataanCities],
  );

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);

    return places.filter((restaurant) => {
      const matchesCity =
        selectedCity === "all" || restaurant.city === selectedCity;
      const searchableText = [
        restaurant.name,
        categoryLabel(restaurant.category),
        restaurant.category,
        restaurant.address,
        restaurant.barangay ? "Barangay " + restaurant.barangay : null,
        restaurant.barangay ? "Brgy " + restaurant.barangay : null,
        restaurant.barangay,
        restaurant.city,
        restaurant.province,
      ]
        .filter(Boolean)
        .map(normalizeSearchText)
        .join(" ");

      return matchesCity && searchableText.includes(normalizedSearch);
    });
  }, [places, selectedCity, searchTerm]);

  const isLoading = isLoadingRestaurants || isLoadingEntries || isLoadingCities;

  function handleCityChange(value) {
    setSelectedCity(value);
    setSelectedRestaurantId(null);
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setSelectedRestaurantId(null);
  }

  return (
    <div
      className="min-h-full bg-[#F5F0E8]"
      style={{ fontFamily: '"Geist Mono", monospace' }}
    >
      <PageHeader
        title="Food Map"
        subtitle="View all top places pinned across Bataan in one easy map."
      />

      <div
        className="mx-auto px-4 pb-24 lg:flex lg:h-[calc(100dvh-12rem)] lg:max-h-[calc(100dvh-12rem)] lg:flex-col lg:pb-4"
        style={pageShellStyle}
      >
        <div className="relative z-20 -mt-8 mb-5 grid gap-3 rounded-3xl border border-[#E8DFC8] bg-stone-50 p-3 shadow-[0_10px_28px_rgba(28,17,7,0.08)] md:grid-cols-[1fr_260px]">
          <div className="flex items-center gap-3 rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3 text-sm text-[#5A4A34] transition focus-within:border-[#E04B39]/20 focus-within:ring-2 focus-within:ring-[#E04B39]/20">
            <Search size={16} className="shrink-0 text-stone-400" />
            <input
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search place, category, address, barangay, or city"
              className="min-w-0 flex-1 bg-transparent font-['Plus_Jakarta_Sans'] text-sm text-[#1C1107] outline-none placeholder:text-stone-400"
            />
          </div>

          <SelectInput
            value={selectedCity}
            onChange={handleCityChange}
            disabled={isLoading || isError || cityOptions.length === 0}
            showPlaceholder={false}
            options={[{ value: "all", label: "All Location" }, ...cityOptions]}
          />
        </div>

        {isError && (
          <div className="rounded-2xl border border-[#E04B39]/20 bg-[#FFF5F1] px-5 py-4 font-['Plus_Jakarta_Sans'] text-sm text-[#8A2A1C]">
            Could not load top places right now. Try again in a moment.
          </div>
        )}

        {!isLoading && !isError && restaurants.length === 0 && (
          <div className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-12 text-center">
            <UtensilsCrossed
              size={36}
              color="#C8B89A"
              className="mx-auto mb-3"
            />
            <p
              className="mb-1.5 text-xl text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              No top places yet
            </p>
          </div>
        )}

        {!isError && restaurants.length > 0 && (
          <div className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.1fr)_390px] lg:overflow-hidden">
            <section className="h-105 overflow-hidden rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] shadow-[0_10px_28px_rgba(28,17,7,0.06)] lg:h-full">
              <FoodMap
                restaurants={filteredRestaurants}
                selectedRestaurantId={selectedRestaurantId}
                onSelectRestaurant={setSelectedRestaurantId}
              />
            </section>

            <section className="min-w-0 overflow-hidden lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:pr-1">
              <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
                <div>
                  <h2
                    className="mt-1 text-2xl font-light text-[#1C1107]"
                    style={{ fontFamily: '"Fraunces", serif' }}
                  >
                    Explore Places
                  </h2>
                </div>
              </div>

              <div className="custom-scrollbar grid min-w-0 auto-rows-max content-start gap-3 overflow-x-hidden overflow-y-auto lg:min-h-0 lg:flex-1 lg:pr-1">
                {isLoading && (
                  <p className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-12 text-center text-sm text-stone-500">
                    Loading top places...
                  </p>
                )}
                {!isLoading && filteredRestaurants.length === 0 && (
                  <div className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-12 text-center">
                    <MapPin
                      size={34}
                      color="#C8B89A"
                      className="mx-auto mb-3"
                    />
                    <p
                      className="mb-1.5 text-xl text-[#1C1107]"
                      style={{ fontFamily: '"Fraunces", serif' }}
                    >
                      No results found
                    </p>
                    <p className="text-xs text-stone-500">
                      Try adjusting your filters or searching for a different
                      area in Bataan.
                    </p>
                  </div>
                )}
                {filteredRestaurants.map((restaurant) => (
                  <FoodCatalogCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={restaurant.id === selectedRestaurantId}
                    onSelect={setSelectedRestaurantId}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
