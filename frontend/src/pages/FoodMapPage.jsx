import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { MapPin, UtensilsCrossed } from "lucide-react";
import { ConnectionErrorState } from "../components/ConnectionErrorState";
import { FoodMap } from "../components/FoodMap";
import { FoodCatalogCard, FoodCatalogCardSkeleton } from "../components/FoodCatalogCard";
import { FoodPlaceFilters } from "../components/FoodPlaceFilters";
import { PageHeader } from "../components/PageHeader";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";
import { useFoodPlaceFilters } from "../hooks/useFoodPlaceFilters";
import { buildPlaceStats } from "../utils/restaurants";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1180px",
  width: "100%",
};

function FoodMapSkeleton() {
  return (
    <div className="relative h-full min-h-90 overflow-hidden bg-[#F5EEE4]">
      <Skeleton
        className="block h-full w-full"
        containerClassName="block h-full w-full"
        height="100%"
        borderRadius={0}
        baseColor="#e7dfd2"
        highlightColor="#f8f4ec"
      />
      <div className="absolute inset-0 opacity-45">
        <div className="absolute left-1/4 top-1/4 h-px w-3/5 rotate-[-18deg] bg-[#C8B89A]" />
        <div className="absolute left-1/6 top-2/3 h-px w-2/3 rotate-12 bg-[#C8B89A]" />
        <div className="absolute left-2/3 top-1/5 h-3/5 w-px rotate-8 bg-[#C8B89A]" />
      </div>
      <div className="absolute left-[24%] top-[34%] h-7 w-7 rounded-full border-4 border-[#A5CF83] bg-[#1C1107] shadow-[0_10px_22px_rgba(28,17,7,0.22)]" />
      <div className="absolute left-[58%] top-[48%] h-8 w-8 rounded-full border-4 border-[#F0E76F] bg-[#E04B39] shadow-[0_10px_22px_rgba(28,17,7,0.22)]" />
      <div className="absolute left-[72%] top-[28%] h-6 w-6 rounded-full border-4 border-[#A5CF83] bg-[#1C1107] shadow-[0_10px_22px_rgba(28,17,7,0.18)]" />
    </div>
  );
}

export function FoodMapPage() {
  const [searchParams] = useSearchParams();
  const { data: restaurants = [], isLoading: isLoadingRestaurants, isError: isRestaurantsError } = useRestaurantLists();
  const { data: entries = [], isLoading: isLoadingEntries, isError: isEntriesError } = useAllEntries();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(() => searchParams.get("placeId") ?? null);

  const places = useMemo(() => buildPlaceStats(restaurants, entries), [restaurants, entries]);
  const {
    searchTerm,
    category,
    cityCode,
    barangay,
    cityOptions,
    barangayOptions,
    loadingCities,
    isCitiesError,
    loadingBarangays,
    filteredPlaces: filteredRestaurants,
    handleSearchChange,
    clearSearch,
    handleCategoryChange,
    handleCityChange,
    handleBarangayChange,
  } = useFoodPlaceFilters(places, {
    onFilterChange: () => setSelectedRestaurantId(null),
  });

  const isLoading = isLoadingRestaurants || isLoadingEntries;
  const hasConnectionError = isRestaurantsError || isEntriesError;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#F5F0E8]">
      <PageHeader title="Discover Bataan's Best" subtitle="View all top places pinned across Bataan in one easy map." />

      <div className="mx-auto flex min-h-0 flex-1 flex-col px-4 pb-4" style={pageShellStyle}>
        <FoodPlaceFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
          searchInputName="foodMapPlaceSearch"
          category={category}
          onCategoryChange={handleCategoryChange}
          cityCode={cityCode}
          onCityChange={handleCityChange}
          cityOptions={cityOptions}
          loadingCities={loadingCities}
          cityError={isCitiesError}
          barangay={barangay}
          onBarangayChange={handleBarangayChange}
          barangayOptions={barangayOptions}
          loadingBarangays={loadingBarangays}
          className="-mt-8 mb-5"
        />

        {hasConnectionError && <ConnectionErrorState />}

        {!isLoading && !hasConnectionError && restaurants.length === 0 && (
          <div className="rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-12 text-center">
            <UtensilsCrossed size={36} color="#C8B89A" className="mx-auto mb-3" />
            <p className="mb-1.5 text-xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
              No food places yet
            </p>
          </div>
        )}

        {!hasConnectionError && (isLoading || restaurants.length > 0) && (
          <div className="custom-scrollbar grid min-h-0 flex-1 gap-5 overflow-y-auto overflow-x-hidden pr-1 lg:overflow-hidden lg:pr-0 lg:grid-cols-[minmax(0,1.1fr)_390px]">
            <section className="h-105 overflow-hidden rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] shadow-[0_10px_28px_rgba(28,17,7,0.06)] lg:h-full">
              {isLoading ? (
                <FoodMapSkeleton />
              ) : (
                <FoodMap
                  restaurants={filteredRestaurants}
                  selectedRestaurantId={selectedRestaurantId}
                  onSelectRestaurant={setSelectedRestaurantId}
                />
              )}
            </section>

            <section className="flex min-h-0 min-w-0 flex-col overflow-visible lg:h-full lg:overflow-hidden lg:pr-1">
              <div className="mb-3 flex shrink-0 items-end justify-between gap-3">
                <div>
                  <h2 className="mt-1 text-2xl font-light text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
                    Explore Places
                  </h2>
                </div>
              </div>

              <div className="custom-scrollbar grid min-h-0 min-w-0 flex-none auto-rows-max content-start gap-3 overflow-visible pb-20 pr-0 lg:flex-1 lg:overflow-x-hidden lg:overflow-y-auto lg:pb-0 lg:pr-1">
                {isLoading && (
                  <>
                    {[0, 1, 2, 3, 4].map((item) => (
                      <FoodCatalogCardSkeleton key={item} />
                    ))}
                  </>
                )}
                {!isLoading && filteredRestaurants.length === 0 && (
                  <div className="rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-12 text-center">
                    <MapPin size={34} className="mx-auto mb-3 text-stone-600" />
                    <p className="mb-1.5 text-xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
                      No results found
                    </p>
                    <p className="text-xs text-stone-600">
                      Oops! Our food radar just flatlined. Try adjusting your filters or hunting for a different
                      delicious corner of Bataan!
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
