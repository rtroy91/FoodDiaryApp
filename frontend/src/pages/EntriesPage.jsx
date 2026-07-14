import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import { EntryCard, EntryCardSkeleton } from "../components/EntryCard";
import { Modal } from "../components/Modal";
import { NoEntriesState } from "../components/NoEntriesState";
import { PublishDiaryForm } from "../components/PublishDiaryForm";
import { StatCard, StatCardSkeleton } from "../components/StatCard";
import { getCurrentUser } from "../api/auth";
import { useAllEntries } from "../hooks/useDiaryData";

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

export function EntriesPage() {
  const { data: entries, isLoading } = useAllEntries();
  const [showVisitModal, setShowVisitModal] = useState(false);

  const stats = useMemo(() => {
    const sourceEntries = entries ?? [];

    return {
      totalPlaces: countUniqueVisitedPlaces(sourceEntries),
      totalEntries: sourceEntries.length,
      avgRating: avg(sourceEntries.map((entry) => entry.rating)),
    };
  }, [entries]);
  const currentUser = getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";

  return (
    <>
      <div className="flex h-dvh flex-col overflow-hidden bg-[#F5F0E8]">
        <div className="relative h-48 shrink-0 overflow-hidden bg-[#1C1107]">
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
              <p className="mt-1 text-sm text-white/55">Here's your food history at a glance.</p>
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

        <div className="mx-auto w-full max-w-140 shrink-0 px-4">
          <div className="relative z-20 mb-6 -mt-7 grid grid-cols-3 gap-2.5">
            {isLoading ? (
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
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-4">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">All posts</span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#E89951] no-underline"
            >
              <ArrowLeft size={13} />
              Home
            </Link>
          </div>

          {isLoading && (
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 pr-1">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[3, 1, 2, 3, 1, 2].map((captionLines, index) => (
                  <EntryCardSkeleton key={`${captionLines}-${index}`} captionLines={captionLines} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && !entries?.length && <NoEntriesState onAddPost={() => setShowVisitModal(true)} />}

          {!isLoading && entries?.length > 0 && (
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 pr-1">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
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
