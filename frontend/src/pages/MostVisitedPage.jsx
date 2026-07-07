import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  Plus,
  Search,
  Star,
  Trophy,
  UtensilsCrossed,
} from "lucide-react";
import { AddRestaurantForm, Modal, StatCard } from "../components";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";

function avg(arr) {
  if (!arr?.length) return 0;
  return arr.reduce((sum, value) => sum + value, 0) / arr.length;
}

function categoryLabel(category) {
  return category ? category.replace(/_/g, " ") : "Other";
}

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? "Brgy. " + restaurant.barangay : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function buildPlaceStats(restaurants = [], entries = []) {
  const byId = new Map();

  restaurants.forEach((restaurant) => {
    byId.set(restaurant.id, {
      ...restaurant,
      visitCount: 0,
      ratingTotal: 0,
      averageRating: null,
    });
  });

  entries.forEach((entry) => {
    const restaurant = entry.restaurant;
    const id = restaurant?.id ?? entry.restaurantId;
    if (!id) return;

    const current = byId.get(id) ?? {
      ...restaurant,
      id,
      name: restaurant?.name ?? "Unknown place",
      visitCount: 0,
      ratingTotal: 0,
      averageRating: null,
    };

    current.visitCount += 1;
    current.ratingTotal += entry.rating ?? 0;
    current.averageRating = current.ratingTotal / current.visitCount;
    byId.set(id, current);
  });

  return [...byId.values()].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? ""),
  );
}

function FoodPlaceCard({ restaurant, compact = false }) {
  const location = getLocation(restaurant);
  const rating = restaurant.averageRating;

  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block h-full no-underline"
    >
      <div className="flex min-h-42 h-full flex-col justify-between rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] p-4 shadow-[0_6px_20px_rgba(28,17,7,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(28,17,7,0.08)]">
        <div>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p
                className="text-xl font-normal leading-snug text-[#1C1107]"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {restaurant.name}
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                {categoryLabel(restaurant.category)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#1C1107] px-2.5 py-1 text-[10px] font-semibold text-white">
              <Star size={12} fill="currentColor" />
              {rating != null ? rating.toFixed(1) : "-"}
            </div>
          </div>

          {restaurant.address && (
            <p className="mb-2 font-['Plus_Jakarta_Sans'] text-sm leading-snug text-[#5A4A34]">
              {restaurant.address}
            </p>
          )}

          {location && (
            <div className="flex items-start gap-1.5 text-xs leading-snug text-stone-500">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E8DFC8] pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
            {restaurant.visitCount ?? 0} visit
            {(restaurant.visitCount ?? 0) === 1 ? "" : "s"}
          </span>
          {!compact && (
            <span className="rounded-full bg-[#F5F0E8] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-widest text-[#7A6A54]">
              View
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

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
  maxWidth: "1024px",
  width: "100%",
};

export function MostVisitedPage() {
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

  const popularPlaces = [...places]
    .filter((place) => place.visitCount > 0)
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 4);

  const favoritePlaces = [...places]
    .filter((place) => place.averageRating != null)
    .sort((a, b) => {
      const ratingDiff = b.averageRating - a.averageRating;
      return ratingDiff || b.visitCount - a.visitCount;
    })
    .slice(0, 2);

  const filteredPlaces = places.filter((place) => {
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

    return matchesCategory && text.includes(searchTerm.trim().toLowerCase());
  });

  const isLoading = loadingRestaurants || loadingEntries;
  const totalPlaces = restaurants?.length ?? 0;
  const totalEntries = entries?.length ?? 0;
  const avgRating = avg(entries?.map((entry) => entry.rating) ?? []);

  return (
    <>
      <div
        className="relative min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        <div className="relative h-48 overflow-hidden bg-[#1C1107]">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 560 164"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <circle cx="480" cy="30" r="60" fill="#A5CF83" opacity="0.08" />
            <circle cx="500" cy="90" r="30" fill="#F0E76F" opacity="0.08" />
            <rect
              x="20"
              y="100"
              width="40"
              height="40"
              fill="#ECB65F"
              opacity="0.08"
              transform="rotate(15 40 120)"
            />
            <circle cx="60" cy="40" r="18" fill="#E89951" opacity="0.08" />
            <rect
              x="380"
              y="120"
              width="20"
              height="20"
              fill="#A5CF83"
              opacity="0.08"
              transform="rotate(30 390 130)"
            />
            <circle cx="200" cy="140" r="10" fill="#F0E76F" opacity="0.08" />
          </svg>

          <div
            className="relative z-10 mx-auto flex items-end justify-between px-5 pt-20 pb-7"
            style={pageShellStyle}
          >
            <div>
              <p
                className="text-3xl font-light leading-tight text-white"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                Food places
              </p>
              <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-white/55">
                Browse the spots you keep coming back to.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#A5CF83] text-[#1C1107] shadow-[0_4px_18px_rgba(0,0,0,0.22)] transition hover:scale-105"
              aria-label="Add place"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="mx-auto px-4" style={pageShellStyle}>
          <div className="relative z-20 mb-6 -mt-7 grid grid-cols-3 gap-2.5">
            <StatCard
              value={totalPlaces}
              label="Places Visited"
              icon={MapPin}
              iconColor="#e63922"
              iconBgColor="#fde8e5"
            />
            <StatCard
              value={totalEntries}
              label="Total Entries"
              icon={Clock}
              iconColor="#2b5fc4"
              iconBgColor="#e3eaf8"
            />
            <StatCard
              value={avgRating > 0 ? avgRating.toFixed(1) : "-"}
              label="Avg Rating"
              icon={Star}
              iconColor="#B8960A"
              iconBgColor="#FEF6C7"
            />
          </div>
        </div>

        <div className="mx-auto px-4 pb-24" style={pageShellStyle}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
              Most visited
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-[11px] font-semibold text-[#E89951]"
            >
              Add place
            </button>
          </div>

          <div className="mb-8 grid gap-3 md:grid-cols-4">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-4 md:col-span-3">
              <Search size={16} className="shrink-0 text-stone-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search place name, address, or city"
                className="min-w-0 flex-1 bg-transparent font-['Plus_Jakarta_Sans'] text-sm text-[#1C1107] outline-none placeholder:text-stone-400"
              />
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-4 text-xs font-semibold uppercase tracking-widest text-[#7A6A54] outline-none md:col-span-1"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {categoryLabel(item)}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <p className="py-14 text-center text-sm text-stone-500">
              Loading food places...
            </p>
          )}

          {!isLoading && (
            <div className="space-y-10">
              <section>
                <SectionHeader eyebrow="Popular" title="Popular places" />
                {popularPlaces.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {popularPlaces.map((place) => (
                      <FoodPlaceCard
                        key={place.id}
                        restaurant={place}
                        compact
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-8 text-center">
                    <Trophy size={30} className="mx-auto mb-3 text-stone-300" />
                    <p className="text-sm text-stone-500">
                      Log visits and your popular places will appear here.
                    </p>
                  </div>
                )}
              </section>

              <section>
                <SectionHeader
                  eyebrow="Your favorite place"
                  title="Highest rated"
                />
                {favoritePlaces.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {favoritePlaces.map((place) => (
                      <FoodPlaceCard key={place.id} restaurant={place} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-8 text-center">
                    <Star size={30} className="mx-auto mb-3 text-stone-300" />
                    <p className="text-sm text-stone-500">
                      Rate a few visits and favorites will show up here.
                    </p>
                  </div>
                )}
              </section>

              <section>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeader
                    eyebrow="All food place"
                    title="Browse every place"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-4 py-3 text-xs font-semibold text-[#1C1107] transition hover:border-[#E89951]"
                  >
                    <Plus size={15} />
                    Cannot find a place?
                  </button>
                </div>

                {filteredPlaces.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredPlaces.map((place) => (
                      <FoodPlaceCard key={place.id} restaurant={place} />
                    ))}
                  </div>
                ) : (
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
                      No matching place
                    </p>
                    <p className="mb-4 text-xs text-stone-500">
                      Add it to your diary so it is ready for your next visit.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="rounded-full bg-[#1C1107] px-6 py-2.5 text-xs font-semibold tracking-wide text-[#A5CF83]"
                    >
                      Add place
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <AddRestaurantForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </>
  );
}
