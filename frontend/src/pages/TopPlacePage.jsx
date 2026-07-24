import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ImageIcon, MapPin, Plus, Star, Trophy, UtensilsCrossed } from "lucide-react";
import { ConnectionErrorState } from "../components/ConnectionErrorState";
import { FoodCatalogCard, FoodCatalogCardSkeleton } from "../components/FoodCatalogCard";
import { FoodPlaceFilters } from "../components/FoodPlaceFilters";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { isAdmin } from "../api/auth";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";
import { useFoodPlaceFilters } from "../hooks/useFoodPlaceFilters";
import { formatFoodPlaceLocation } from "../utils/location";
import { buildPlaceStats } from "../utils/restaurants";

const RestaurantForm = lazy(() =>
  import("../components/RestaurantForm").then((module) => ({
    default: module.RestaurantForm,
  }))
);

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-600">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-light text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
        {title}
      </h2>
    </div>
  );
}

function TopPlaceAccordionSkeleton() {
  return (
    <div
      className="custom-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-2 sm:w-full sm:snap-none sm:flex-row sm:items-center sm:overflow-hidden sm:pb-0"
      aria-hidden="true"
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className={[
            "group flex h-24 w-[85vw] shrink-0 snap-start items-center overflow-hidden rounded-2xl border border-stone-200 bg-white px-3 shadow-none sm:w-auto",
            item === 0
              ? "sm:flex-[1_1_24rem] md:flex-[1_1_0] lg:max-w-md lg:flex-[1_1_24rem]"
              : item === 1
                ? "sm:flex-[0_0_5.5rem] md:flex-[1_1_0] lg:max-w-md lg:flex-[1_1_24rem]"
                : "sm:flex-[0_0_5.5rem] lg:flex-[0_0_6rem]",
          ].join(" ")}
        >
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5EEE4]">
            <Skeleton width={64} height={64} borderRadius={12} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
            <span className="absolute bottom-1 right-1 h-4 w-6 rounded-full bg-[#1C1107]/20" />
          </div>

          <div
            className={[
              "ml-4 grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3",
              item === 0
                ? "opacity-100"
                : item === 1
                  ? "opacity-100 sm:opacity-0 md:opacity-100 lg:opacity-0"
                  : "opacity-100 sm:opacity-0",
            ].join(" ")}
          >
            <div className="min-w-0">
              <Skeleton width={150} height={20} borderRadius={6} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
              <div className="mt-2 flex min-w-0 items-center gap-1.5">
                <MapPin size={12} className="shrink-0 text-stone-600" />
                <Skeleton width={130} height={14} borderRadius={6} baseColor="#f0ebe2" highlightColor="#fbf8f2" />
              </div>
            </div>

            <Skeleton width={58} height={22} borderRadius={999} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatReach(value = 0) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return value.toString();
}

// #region Expanded Card
function TopPlaceAccordionItem({ place, rank, mode, isExpanded, isPairedTabletExpansion, onMouseEnter }) {
  const storePhotoUrl = place?.storePhotoUrl ?? null;
  const location = formatFoodPlaceLocation(place);
  const rating = place.averageRating;
  const visitCount = place.visitCount ?? 0;
  const visitLabel = `${formatReach(visitCount)} ${visitCount === 1 ? "visit" : "visits"}`;
  const stat =
    mode === "rating"
      ? {
          icon: <Star size={12} fill="currentColor" />,
          value: rating != null ? rating.toFixed(1) : "-",
          className: "text-amber-700",
        }
      : {
          value: visitLabel,
          className: "rounded-full bg-[#E8F7D3] px-2.5 py-1 text-[#365314]",
        };
  const detailsClassName = [
    "ml-4 grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-left transition-opacity delay-75 duration-200 motion-reduce:transition-none",
    isExpanded
      ? "opacity-100"
      : isPairedTabletExpansion
        ? "opacity-100 sm:opacity-0 md:opacity-100 lg:opacity-0"
        : "opacity-100 sm:opacity-0",
  ].join(" ");
  const itemClassName = [
    "group flex h-24 w-[85vw] shrink-0 snap-start items-center overflow-hidden rounded-2xl border border-stone-200 bg-white px-3 text-left no-underline shadow-none transition-[border-color,box-shadow,background-color,flex-basis,max-width] duration-300 ease-out hover:border-[#E8DFC8] hover:shadow-md focus-visible:border-[#E04B39]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/15 motion-reduce:transition-none sm:w-auto",
    isExpanded
      ? "sm:max-w-[28rem] sm:flex-[1_1_24rem] md:max-w-none md:flex-[1_1_0] lg:max-w-[28rem] lg:flex-[1_1_24rem]"
      : isPairedTabletExpansion
        ? "sm:flex-[0_0_5.5rem] md:flex-[1_1_0] lg:flex-[0_0_6rem]"
        : "sm:flex-[0_0_5.5rem] lg:flex-[0_0_6rem]",
  ].join(" ");

  return (
    <Link
      to={`/place-details/${place.id}`}
      className={itemClassName}
      onMouseEnter={onMouseEnter}
      onFocus={onMouseEnter}
    >
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5EEE4]">
        {storePhotoUrl ? (
          <img src={storePhotoUrl} alt={place.name} width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-600">
            <ImageIcon size={20} />
          </div>
        )}
        <span className="absolute bottom-1 right-1 rounded-full bg-[#1C1107] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
          #{rank}
        </span>
      </div>

      <div className={detailsClassName}>
        <div className="min-w-0">
          <p className="min-w-0 truncate text-base font-['Fraunces'] font-semibold leading-snug text-stone-900">
            {place.name}
          </p>

          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs font-medium text-stone-600">
            {location && <MapPin size={12} className="shrink-0 text-stone-600" />}
            <span className="truncate">{location}</span>
          </p>
        </div>

        <div className="flex shrink-0 justify-end self-start pt-0.5">
          <span className={`inline-flex items-center gap-1 text-xs font-bold ${stat.className}`}>
            {stat.icon}
            {stat.value}
          </span>
        </div>
      </div>
    </Link>
  );
}

function TopPlaceAccordion({ places, mode }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div
      className="custom-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden pb-2 pt-2 sm:w-full sm:snap-none sm:flex-row sm:items-center sm:overflow-hidden sm:pb-0"
      onMouseLeave={() => setExpandedIndex(0)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setExpandedIndex(0);
        }
      }}
    >
      {places.map((place, index) => (
        <TopPlaceAccordionItem
          key={place.id}
          place={place}
          rank={index + 1}
          mode={mode}
          isExpanded={index === expandedIndex}
          isPairedTabletExpansion={(expandedIndex === 2 ? index === 1 : index < 2) && index !== expandedIndex}
          onMouseEnter={() => setExpandedIndex(index)}
        />
      ))}
    </div>
  );
}
// #endregion

export function TopPlacePage() {
  const { data: foodplace, isLoading: loadingRestaurants, isError: isRestaurantsError } = useRestaurantLists();
  const { data: entries, isLoading: loadingEntries, isError: isEntriesError } = useAllEntries();
  const [showAddModal, setShowAddModal] = useState(false);
  const canManageRestaurants = isAdmin();

  const places = useMemo(() => buildPlaceStats(foodplace ?? [], entries ?? []), [foodplace, entries]);
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
    hasActiveFilters,
    filteredPlaces,
    handleSearchChange,
    handleCategoryChange,
    handleCityChange,
    handleBarangayChange,
  } = useFoodPlaceFilters(places);

  const popularPlaces = useMemo(
    () =>
      [...places]
        .filter((place) => place.visitCount > 0)
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 3),
    [places]
  );

  const favoritePlaces = useMemo(
    () =>
      [...places]
        .filter((place) => place.averageRating != null)
        .sort((a, b) => {
          const ratingDiff = b.averageRating - a.averageRating;
          return ratingDiff || b.visitCount - a.visitCount;
        })
        .slice(0, 3),
    [places]
  );

  const isLoading = loadingRestaurants || loadingEntries;
  const hasConnectionError = isRestaurantsError || isEntriesError;

  return (
    <>
      <div className="relative flex h-full flex-col overflow-hidden bg-[#F5F0E8]">
        <PageHeader title="Top Places" subtitle="Browse the spots you keep coming back to." maxWidth="1180px" />

        <div className="mx-auto flex min-h-0 w-full max-w-295 flex-1 flex-col px-4 pb-4">
          <FoodPlaceFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
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
          />

          {hasConnectionError ? (
            <ConnectionErrorState />
          ) : isLoading ? (
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto overflow-x-hidden pr-1 lg:overflow-hidden lg:pr-0">
              <div
                className={["shrink-0 gap-6 lg:grid lg:grid-cols-2", hasActiveFilters ? "hidden" : "grid"].join(" ")}
              >
                <section className="min-w-0">
                  <SectionHeader eyebrow="TRENDING" title="Trending Spots" />
                  <TopPlaceAccordionSkeleton />
                </section>

                <section className="min-w-0">
                  <SectionHeader eyebrow="TOP TIERS" title="Highest rated" />
                  <TopPlaceAccordionSkeleton />
                </section>
              </div>

              <section className="flex min-h-0 flex-1 flex-col overflow-visible lg:overflow-hidden">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeader eyebrow="All food place" title="Browse every place" />
                  {canManageRestaurants && (
                    <div className="h-12 w-full rounded-xl bg-[#E04B39]/20 sm:w-44" aria-hidden="true" />
                  )}
                </div>

                <div className="custom-scrollbar grid min-h-0 flex-none gap-4 overflow-visible pb-20 pr-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 md:grid-cols-2">
                  {[0, 1, 2, 3, 4, 5].map((item) => (
                    <FoodCatalogCardSkeleton key={item} />
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-10 overflow-y-auto overflow-x-hidden pr-1 lg:overflow-hidden lg:pr-0">
              <div
                className={["shrink-0 gap-6 lg:grid lg:grid-cols-2", hasActiveFilters ? "hidden" : "grid"].join(" ")}
              >
                <section className="min-w-0">
                  <SectionHeader eyebrow="TRENDING" title="Trending Spots" />
                  {popularPlaces.length > 0 ? (
                    <TopPlaceAccordion places={popularPlaces} mode="visits" />
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-8 text-center">
                      <Trophy size={30} className="mx-auto mb-3 text-stone-600" />
                      <p className="text-sm text-stone-600">Places you practically pay rent at.</p>
                    </div>
                  )}
                </section>

                <section className="min-w-0">
                  <SectionHeader eyebrow="TOP TIERS" title="Highest rated" />
                  {favoritePlaces.length > 0 ? (
                    <TopPlaceAccordion places={favoritePlaces} mode="rating" />
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-8 text-center">
                      <Star size={30} className="mx-auto mb-3 text-stone-600" />
                      <p className="text-sm text-stone-600">Approved by your tastebuds (and your wallet).</p>
                    </div>
                  )}
                </section>
              </div>

              <section className="flex min-h-0 flex-1 flex-col overflow-visible lg:overflow-hidden">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeader eyebrow="All food place" title="Browse every place" />
                  {canManageRestaurants && (
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E04B39] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#c93c2f]"
                    >
                      <Plus size={15} />
                      Cannot find a place?
                    </button>
                  )}
                </div>

                {filteredPlaces.length > 0 ? (
                  <div className="custom-scrollbar grid min-h-0 flex-none gap-4 overflow-visible pb-20 pr-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1 md:grid-cols-2">
                    {filteredPlaces.map((place) => (
                      <FoodCatalogCard key={place.id} restaurant={place} />
                    ))}
                  </div>
                ) : (
                  <div className="custom-scrollbar min-h-0 flex-none overflow-visible pb-20 pr-0 lg:flex-1 lg:overflow-y-auto lg:overflow-x-hidden lg:pr-1">
                    <div className="rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-12 text-center">
                      <UtensilsCrossed size={36} className="mx-auto mb-3 text-stone-600" />
                      <p className="mb-1.5 text-xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
                        Place not found
                      </p>
                      <p className="mb-4 text-xs text-stone-600">
                        Submit it to the team so we can add it to our directory for everyone.
                      </p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {showAddModal && canManageRestaurants && (
        <Modal
          onClose={() => setShowAddModal(false)}
          closeOnBackdrop={false}
          closeOnEscape={false}
          ariaLabelledBy="restaurant-form-title"
        >
          <Suspense fallback={<div className="rounded-3xl bg-white p-8 text-center">Loading form…</div>}>
            <RestaurantForm onClose={() => setShowAddModal(false)} />
          </Suspense>
        </Modal>
      )}
    </>
  );
}
