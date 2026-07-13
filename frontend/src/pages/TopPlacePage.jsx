import { lazy, Suspense, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ImageIcon,
  MapPin,
  Plus,
  Search,
  Star,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { FoodCatalogCard } from "../components/FoodCatalogCard";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SelectInput } from "../components/SelectInput";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";
import { buildPlaceStats, categoryLabel } from "../utils/restaurants";

const RestaurantForm = lazy(() =>
  import("../components/RestaurantForm").then((module) => ({
    default: module.RestaurantForm,
  })),
);

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
        {eyebrow}
      </p>
      <h2
        className="mt-1 text-2xl font-light text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {title}
      </h2>
    </div>
  );
}

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1180px",
  width: "100%",
};

function getLocation(place) {
  return [
    place?.barangay ? `Brgy. ${place.barangay}` : null,
    place?.city,
    place?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function getThumbnailUrl(place) {
  return (
    place?.thumbnailUrl ??
    place?.photoUrl ??
    place?.imageUrl ??
    place?.coverPhotoUrl ??
    null
  );
}

function formatReach(value = 0) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return value.toString();
}

function TopPlaceAccordionItem({ place, rank, mode, isExpanded, onMouseEnter }) {
  const thumbnailUrl = getThumbnailUrl(place);
  const location = getLocation(place);
  const rating = place.averageRating;
  const visitCount = place.visitCount ?? 0;
  const visitLabel = `${formatReach(visitCount)} ${
    visitCount === 1 ? "visit" : "visits"
  }`;
  const stat =
    mode === "rating"
      ? {
          icon: <Star size={12} fill="currentColor" />,
          value: rating != null ? rating.toFixed(1) : "-",
          className: "text-amber-500",
        }
      : {
          value: visitLabel,
          className: "rounded-full bg-[#E8F7D3] px-2.5 py-1 text-[#365314]",
        };
  const detailsClassName = [
    "ml-4 grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-left transition-opacity delay-75 duration-200",
    isExpanded ? "opacity-100" : "opacity-100 sm:opacity-0",
  ].join(" ");
  const itemClassName = [
    "group flex h-24 w-full min-w-0 items-center overflow-hidden rounded-2xl border border-stone-200 bg-white px-3 text-left no-underline shadow-none transition-all duration-300 ease-out hover:border-[#E8DFC8] hover:shadow-md focus-visible:border-[#E04B39]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/15 sm:w-auto",
    isExpanded
      ? "sm:max-w-[28rem] sm:flex-[1_1_24rem]"
      : "sm:flex-[0_0_6rem]",
  ].join(" ");

  return (
    <Link
      to={`/place-details/${place.id}`}
      className={itemClassName}
      onMouseEnter={onMouseEnter}
      onFocus={onMouseEnter}
    >
      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#F5EEE4]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={place.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <ImageIcon size={20} />
          </div>
        )}
        <span className="absolute bottom-1 right-1 rounded-full bg-[#1C1107] px-1.5 py-0.5 font-['Plus_Jakarta_Sans'] text-[10px] font-bold leading-none text-white">
          #{rank}
        </span>
      </div>

      <div className={detailsClassName}>
        <div className="min-w-0">
          <p className="min-w-0 truncate text-base font-['Fraunces'] font-semibold leading-snug text-stone-900">
            {place.name}
          </p>

          <p className="mt-1 flex min-w-0 items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs font-medium text-stone-500">
            {location && (
              <MapPin size={12} className="shrink-0 text-stone-400" />
            )}
            <span className="truncate">{location}</span>
          </p>
        </div>

        <div className="flex shrink-0 justify-end self-start pt-0.5">
          <span
            className={`inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-xs font-bold ${stat.className}`}
          >
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
      className="flex w-full flex-col gap-3 overflow-hidden py-2 sm:flex-row sm:items-center"
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
          onMouseEnter={() => setExpandedIndex(index)}
        />
      ))}
    </div>
  );
}

export function TopPlacePage() {
  const { data: restaurants, isLoading: loadingRestaurants } =
    useRestaurantLists();
  const { data: entries, isLoading: loadingEntries } = useAllEntries();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const places = useMemo(
    () => buildPlaceStats(restaurants ?? [], entries ?? []),
    [restaurants, entries],
  );

  const categories = useMemo(() => {
    const unique = new Set(
      places.map((place) => place.category).filter(Boolean),
    );
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [places]);

  const popularPlaces = useMemo(
    () =>
      [...places]
        .filter((place) => place.visitCount > 0)
        .sort((a, b) => b.visitCount - a.visitCount)
        .slice(0, 3),
    [places],
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
    [places],
  );

  const filteredPlaces = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return places.filter((place) => {
      const matchesCategory = category === "all" || place.category === category;
      const text = [
        place.name,
        place.address,
        place.barangay,
        place.city,
        place.province,
        place.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && text.includes(normalizedSearchTerm);
    });
  }, [category, places, searchTerm]);

  const isLoading = loadingRestaurants || loadingEntries;

  return (
    <>
      <div
        className="relative flex h-full flex-col overflow-hidden bg-[#F5F0E8]"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        <PageHeader
          title="Top Places"
          subtitle="Browse the spots you keep coming back to."
          maxWidth="1180px"
        />

        <div
          className="mx-auto flex min-h-0 flex-1 flex-col px-4 pb-4"
          style={pageShellStyle}
        >
          <div className="relative z-20 -mt-8 mb-8 grid shrink-0 gap-3 rounded-3xl border border-[#E8DFC8] bg-stone-50 p-3 shadow-[0_10px_28px_rgba(28,17,7,0.08)] md:grid-cols-[1fr_260px]">
            <label className="flex items-center gap-3 rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3 text-sm text-[#5A4A34] transition focus-within:border-[#E04B39]/20 focus-within:ring-2 focus-within:ring-[#E04B39]/20">
              <Search size={16} className="shrink-0 text-stone-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search place name, address, or city"
                className="min-w-0 flex-1 bg-transparent font-['Plus_Jakarta_Sans'] text-sm text-[#1C1107] outline-none placeholder:text-stone-400"
              />
            </label>

            <SelectInput
              value={category}
              onChange={setCategory}
              showPlaceholder={false}
              options={[
                { value: "all", label: "All Categories" },
                ...categories.map((item) => ({
                  value: item,
                  label: categoryLabel(item),
                })),
              ]}
            />
          </div>

          {isLoading && (
            <p className="py-14 text-center text-sm text-stone-500">
              Loading top places...
            </p>
          )}

          {!isLoading && (
            <div className="flex min-h-0 flex-1 flex-col gap-10 overflow-hidden">
              <div className="grid shrink-0 gap-6 lg:grid-cols-2">
                <section className="min-w-0">
                  <SectionHeader eyebrow="TRENDING" title="Trending Spots" />
                  {popularPlaces.length > 0 ? (
                    <TopPlaceAccordion places={popularPlaces} mode="visits" />
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-8 text-center">
                      <Trophy
                        size={30}
                        className="mx-auto mb-3 text-stone-300"
                      />
                      <p className="text-sm text-stone-500">
                        Log visits and popular places will appear here.
                      </p>
                    </div>
                  )}
                </section>

                <section className="min-w-0">
                  <SectionHeader
                    eyebrow="TOP TIERS"
                    title="Highest rated"
                  />
                  {favoritePlaces.length > 0 ? (
                    <TopPlaceAccordion places={favoritePlaces} mode="rating" />
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-8 text-center">
                      <Star size={30} className="mx-auto mb-3 text-stone-300" />
                      <p className="text-sm text-stone-500">
                        Rate a few visits and favorites will show up here.
                      </p>
                    </div>
                  )}
                </section>
              </div>

              <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeader
                    eyebrow="All food place"
                    title="Browse every place"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E04B39] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c93c2f]"
                  > 
                    <Plus size={15} />
                    Cannot find a place?
                  </button>
                </div>

                {filteredPlaces.length > 0 ? (
                  <div className="custom-scrollbar grid min-h-0 flex-1 gap-4 overflow-y-auto overflow-x-hidden pb-20 pr-1 md:grid-cols-2">
                    {filteredPlaces.map((place) => (
                      <FoodCatalogCard key={place.id} restaurant={place} />
                    ))}
                  </div>
                ) : (
                  <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 pr-1">
                    <div className="rounded-2xl border border-[#E8DFC8] bg-stone-50 px-5 py-12 text-center">
                    <UtensilsCrossed
                      size={36}
                      color="#C8B89A"
                      className="mx-auto mb-3"
                    />
                    <p
                      className="mb-1.5 text-xl text-[#1C1107]"
                      style={{ fontFamily: '"Fraunces", serif' }}
                    >
                      Place not found
                    </p>
                    <p className="mb-4 text-xs text-stone-500">
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

      {showAddModal && (
        <Modal
          onClose={() => setShowAddModal(false)}
          closeOnBackdrop={false}
          closeOnEscape={false}
        >
          <Suspense fallback={null}>
            <RestaurantForm onClose={() => setShowAddModal(false)} />
          </Suspense>
        </Modal>
      )}
    </>
  );
}
