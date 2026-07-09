import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
} from "lucide-react";
import {
  Modal,
  PublishDiaryForm,
  StatCard,
  EntryCard,
  NoEntriesState,
} from "../components";
import { getCurrentUser } from "../api/auth";
import {
  useAllEntries,
  useRecentEntries,
  useRestaurantLists,
} from "../hooks/useDiaryData";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(d) {
  return d.toLocaleDateString("en-PH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function avg(arr) {
  if (!arr?.length) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function countUniqueVisitedPlaces(entries = []) {
  const ids = new Set();

  entries.forEach((entry) => {
    const restaurant = entry.restaurant;
    const key =
      restaurant?.id ??
      entry.restaurantId ??
      [
        restaurant?.name,
        restaurant?.barangay,
        restaurant?.city,
        restaurant?.province,
      ]
        .filter(Boolean)
        .join("|");

    if (key) ids.add(key);
  });

  return ids.size;
}

export function HomePage() {
  const { data: entries, isLoading: loadingEntries } = useRecentEntries(10);
  const { data: allEntries } = useAllEntries();
  const { data: restaurants } = useRestaurantLists();

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);

  const totalPlaces = countUniqueVisitedPlaces(allEntries ?? []);
  const totalEntries = allEntries?.length ?? 0;
  const avgRating = avg(allEntries?.map((e) => e.rating) ?? []);
  const currentUser = getCurrentUser();
  const userName =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";
  const recentEntries = entries ?? [];
  const activeEntry =
    recentEntries.length > 0
      ? recentEntries[activeEntryIndex % recentEntries.length]
      : null;

  function showPreviousEntry() {
    setActiveEntryIndex((current) =>
      recentEntries.length
        ? (current - 1 + recentEntries.length) % recentEntries.length
        : 0,
    );
  }

  function showNextEntry() {
    setActiveEntryIndex((current) =>
      recentEntries.length ? (current + 1) % recentEntries.length : 0,
    );
  }

  return (
    <>
      <div
        className="relative h-dvh overflow-hidden bg-[#F5F0E8]"
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

          <div className="relative z-10 mx-auto flex max-w-140 items-end justify-between px-5 pt-20 pb-7">
            <div>
              <p
                className="text-3xl font-light leading-tight text-white"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {getGreeting()},{" "}
                <span className="italic text-[#F0E76F]">{userName}</span>
              </p>
              <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-white/55">
                Here's your food history at a glance.
              </p>
            </div>

            <div className="text-right">
              <p
                className="text-[36px] font-light leading-none text-white/12"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {String(new Date().getDate()).padStart(2, "0")}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/[0.28]">
                {formatDate(new Date())}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-140 px-4">
          <div className="relative z-20 mb-4 -mt-7 grid grid-cols-3 gap-2.5">
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
              value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
              label="Avg Rating"
              icon={Star}
              iconColor="#B8960A"
              iconBgColor="#FEF6C7"
            />
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
              Recent post
            </span>
            <Link
              to="/entries"
              className="text-[11px] font-semibold text-[#E89951] no-underline"
            >
              See all →
            </Link>
          </div>

          {loadingEntries && (
            <p className="py-10 text-center text-sm text-stone-500">
              Loading your diary…
            </p>
          )}

          {!loadingEntries && !entries?.length && (
            <NoEntriesState onAddPost={() => setShowVisitModal(true)} />
          )}

          {!loadingEntries && activeEntry && (
            <div className="relative left-1/2 w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 pb-2">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
                <button
                  type="button"
                  onClick={showPreviousEntry}
                  aria-label="Show previous entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] shadow-[0_2px_8px_rgba(28,42,61,0.08)] transition hover:bg-[#F7FAFD]"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="min-w-0">
                  <EntryCard entry={activeEntry} featured />
                </div>

                <button
                  type="button"
                  onClick={showNextEntry}
                  aria-label="Show next entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] shadow-[0_2px_8px_rgba(28,42,61,0.08)] transition hover:bg-[#F7FAFD]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-4 flex justify-center gap-2">
                {recentEntries.map((entry, index) => {
                  const isActive =
                    index === activeEntryIndex % recentEntries.length;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveEntryIndex(index)}
                      aria-label={`Show entry ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`h-2.5 rounded-full transition ${
                        isActive
                          ? "w-6 bg-[#1C1107]"
                          : "w-2.5 bg-[#D6C8AD] hover:bg-[#BBAA8A]"
                      }`}
                    />
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowVisitModal(true)}
                className="mx-auto mt-3 flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f]"
              >
                <Plus size={16} />
                Add Post
              </button>
            </div>
          )}
        </div>
      </div>
      {showVisitModal && (
        <Modal
          onClose={() => setShowVisitModal(false)}
          closeOnBackdrop={false}
          closeOnEscape={false}
        >
          <PublishDiaryForm
            restaurants={restaurants ?? []}
            onClose={() => setShowVisitModal(false)}
          />
        </Modal>
      )}
    </>
  );
}
