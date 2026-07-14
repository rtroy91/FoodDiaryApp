import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ChevronLeft, ChevronRight, Star, Plus } from "lucide-react";
import { EntryCard, EntryCardSkeleton } from "../components/EntryCard";
import { Modal } from "../components/Modal";
import { NoEntriesState } from "../components/NoEntriesState";
import { PublishDiaryForm } from "../components/PublishDiaryForm";
import { StatCard, StatCardSkeleton } from "../components/StatCard";
import { getCurrentUser } from "../api/auth";
import { useAllEntries, useRecentEntries } from "../hooks/useDiaryData";

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
      [restaurant?.name, restaurant?.barangay, restaurant?.city, restaurant?.province].filter(Boolean).join("|");

    if (key) ids.add(key);
  });

  return ids.size;
}

function getPaginationDotClass(index, activeIndex, total) {
  const distance = Math.min(Math.abs(index - activeIndex), total - Math.abs(index - activeIndex));

  if (distance === 0) return "h-1.5 w-4 bg-[#E89951]";
  if (distance === 1) return "h-1.5 w-1.5 bg-stone-400";

  return "h-1 w-1 bg-stone-300/60";
}

function getCarouselMotionClass(motion) {
  if (motion === "exit-next") return "-translate-x-5 opacity-0";
  if (motion === "exit-previous") return "translate-x-5 opacity-0";
  if (motion === "enter-next") return "translate-x-5 opacity-0";
  if (motion === "enter-previous") return "-translate-x-5 opacity-0";

  return "translate-x-0 opacity-100";
}

export function FeaturedPage() {
  const { data: entries, isLoading: loadingEntries } = useRecentEntries(10);
  const { data: allEntries, isLoading: loadingAllEntries } = useAllEntries();

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [carouselMotion, setCarouselMotion] = useState("idle");
  const carouselTimerRef = useRef(null);

  const stats = useMemo(() => {
    const sourceEntries = allEntries ?? [];

    return {
      totalPlaces: countUniqueVisitedPlaces(sourceEntries),
      totalEntries: sourceEntries.length,
      avgRating: avg(sourceEntries.map((entry) => entry.rating)),
    };
  }, [allEntries]);
  const currentUser = getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";
  const recentEntries = entries ?? [];
  const activeEntry = recentEntries.length > 0 ? recentEntries[activeEntryIndex % recentEntries.length] : null;

  useEffect(() => {
    return () => {
      if (carouselTimerRef.current) {
        window.clearTimeout(carouselTimerRef.current);
      }
    };
  }, []);

  function moveEntry(direction) {
    if (recentEntries.length <= 1 || carouselMotion !== "idle") return;

    setCarouselMotion(`exit-${direction}`);

    carouselTimerRef.current = window.setTimeout(() => {
      setActiveEntryIndex((current) => {
        if (!recentEntries.length) return 0;

        return direction === "next"
          ? (current + 1) % recentEntries.length
          : (current - 1 + recentEntries.length) % recentEntries.length;
      });

      setCarouselMotion(`enter-${direction}`);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCarouselMotion("idle"));
      });
    }, 120);
  }

  function showPreviousEntry() {
    moveEntry("previous");
  }

  function showNextEntry() {
    moveEntry("next");
  }

  return (
    <>
      <div className="relative h-full overflow-hidden bg-[#F5F0E8]">
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
            <rect x="20" y="100" width="40" height="40" fill="#ECB65F" opacity="0.08" transform="rotate(15 40 120)" />
            <circle cx="60" cy="40" r="18" fill="#E89951" opacity="0.08" />
            <rect x="380" y="120" width="20" height="20" fill="#A5CF83" opacity="0.08" transform="rotate(30 390 130)" />
            <circle cx="200" cy="140" r="10" fill="#F0E76F" opacity="0.08" />
          </svg>

          <div className="relative z-10 mx-auto flex max-w-140 items-end justify-between px-5 pt-20 pb-7">
            <div>
              <p className="text-3xl font-light leading-tight text-white" style={{ fontFamily: '"Fraunces", serif' }}>
                {getGreeting()}, <span className="italic text-[#F0E76F]">{userName}</span>
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
              <p className="text-[10px] uppercase tracking-widest text-white/[0.28]">{formatDate(new Date())}</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-140 px-4">
          <div className="relative z-20 mb-4 -mt-7 grid grid-cols-3 gap-2.5">
            {loadingAllEntries ? (
              <>
                <StatCardSkeleton icon={MapPin} iconColor="#e63922" iconBgColor="#fde8e5" />
                <StatCardSkeleton icon={Clock} iconColor="#2b5fc4" iconBgColor="#e3eaf8" />
                <StatCardSkeleton icon={Star} iconColor="#B8960A" iconBgColor="#FEF6C7" />
              </>
            ) : (
              <>
                <StatCard
                  value={stats.totalPlaces}
                  label="Places Visited"
                  icon={MapPin}
                  iconColor="#e63922"
                  iconBgColor="#fde8e5"
                />
                <StatCard
                  value={stats.totalEntries}
                  label="Total Entries"
                  icon={Clock}
                  iconColor="#2b5fc4"
                  iconBgColor="#e3eaf8"
                />
                <StatCard
                  value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
                  label="Avg Rating"
                  icon={Star}
                  iconColor="#B8960A"
                  iconBgColor="#FEF6C7"
                />
              </>
            )}
          </div>

          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Recent post</span>
            <Link to="/entries" className="text-[11px] font-semibold text-[#E89951] no-underline">
              See all →
            </Link>
          </div>

          {loadingEntries && (
            <div className="relative left-1/2 w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 pb-2">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
                <button
                  type="button"
                  disabled
                  aria-label="Show previous entry"
                  className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] opacity-55 shadow-[0_2px_8px_rgba(28,42,61,0.08)]"
                >
                  <ChevronLeft size={20} />
                </button>

                <EntryCardSkeleton featured />

                <button
                  type="button"
                  disabled
                  aria-label="Show next entry"
                  className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] opacity-55 shadow-[0_2px_8px_rgba(28,42,61,0.08)]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <span
                    key={dot}
                    className={`rounded-full ${dot === 2 ? "h-1.5 w-4 bg-[#E89951]" : "h-1.5 w-1.5 bg-stone-300"}`}
                  />
                ))}
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

          {!loadingEntries && !entries?.length && <NoEntriesState onAddPost={() => setShowVisitModal(true)} />}

          {!loadingEntries && activeEntry && (
            <div className="relative left-1/2 w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 pb-2">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
                <button
                  type="button"
                  onClick={showPreviousEntry}
                  disabled={carouselMotion !== "idle"}
                  aria-label="Show previous entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] shadow-[0_2px_8px_rgba(28,42,61,0.08)] transition hover:bg-[#F7FAFD] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <ChevronLeft size={20} />
                </button>

                <div
                  className={`min-w-0 transform-gpu transition-[opacity,transform] duration-200 ease-out ${getCarouselMotionClass(
                    carouselMotion
                  )}`}
                >
                  <EntryCard entry={activeEntry} featured />
                </div>

                <button
                  type="button"
                  onClick={showNextEntry}
                  disabled={carouselMotion !== "idle"}
                  aria-label="Show next entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] shadow-[0_2px_8px_rgba(28,42,61,0.08)] transition hover:bg-[#F7FAFD] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                {recentEntries.map((entry, index) => {
                  const isActive = index === activeEntryIndex % recentEntries.length;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveEntryIndex(index)}
                      aria-label={`Show entry ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className={`rounded-full transition-all duration-300 hover:bg-[#E89951] ${getPaginationDotClass(
                        index,
                        activeEntryIndex % recentEntries.length,
                        recentEntries.length
                      )}`}
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
        <Modal onClose={() => setShowVisitModal(false)} closeOnBackdrop={false} closeOnEscape={false}>
          <PublishDiaryForm onClose={() => setShowVisitModal(false)} />
        </Modal>
      )}
    </>
  );
}
