import { lazy, Suspense, useMemo, useState } from "react";
import { Plus, Search, Star, Trophy, UtensilsCrossed } from "lucide-react";
import { FoodCatalogCard } from "../components/FoodCatalogCard";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SelectInput } from "../components/SelectInput";
import { useAllEntries, useRestaurantLists } from "../hooks/useDiaryData";
import { buildPlaceStats, categoryLabel } from "../utils/restaurants";

const AddRestaurantForm = lazy(() =>
  import("../components/AddRestaurantForm").then((module) => ({
    default: module.AddRestaurantForm,
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
        className="relative min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        <PageHeader
          title="Top Places"
          subtitle="Browse the spots you keep coming back to."
          maxWidth="1180px"
        />

        <div className="mx-auto px-4 pb-24" style={pageShellStyle}>
          <div className="relative z-20 -mt-8 mb-8 grid gap-3 rounded-3xl border border-[#E8DFC8] bg-stone-50 p-3 shadow-[0_10px_28px_rgba(28,17,7,0.08)] md:grid-cols-[1fr_260px]">
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
            <div className="space-y-10">
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="min-w-0">
                  <SectionHeader eyebrow="Popular" title="Popular places" />
                  {popularPlaces.length > 0 ? (
                    <div className="grid gap-3">
                      {popularPlaces.map((place) => (
                        <FoodCatalogCard
                          key={place.id}
                          restaurant={place}
                          compact
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-8 text-center">
                      <Trophy
                        size={30}
                        className="mx-auto mb-3 text-stone-300"
                      />
                      <p className="text-sm text-stone-500">
                        Log visits and your popular places will appear here.
                      </p>
                    </div>
                  )}
                </section>

                <section className="min-w-0">
                  <SectionHeader
                    eyebrow="Your favorite place"
                    title="Highest rated"
                  />
                  {favoritePlaces.length > 0 ? (
                    <div className="grid gap-3">
                      {favoritePlaces.map((place) => (
                        <FoodCatalogCard key={place.id} restaurant={place} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-42 flex-col items-center justify-center rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4] px-5 py-8 text-center">
                      <Star size={30} className="mx-auto mb-3 text-stone-300" />
                      <p className="text-sm text-stone-500">
                        Rate a few visits and favorites will show up here.
                      </p>
                    </div>
                  )}
                </section>
              </div>

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
                      <FoodCatalogCard key={place.id} restaurant={place} />
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
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <Suspense fallback={null}>
            <AddRestaurantForm onClose={() => setShowAddModal(false)} />
          </Suspense>
        </Modal>
      )}
    </>
  );
}
