import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Clock,
  ChevronRight,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Modal, LogVisitForm, StatCard, EntryCard } from "../components";
import { useRecentEntries, useRestaurantLists } from "../hooks/useDiaryData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function findOnThisDay(entries) {
  if (!entries?.length) return null;
  const today = new Date();
  return (
    entries.find((e) => {
      const d = new Date(e.visitedAt);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() < today.getFullYear()
      );
    }) ?? null
  );
}

function OnThisDayBanner({ entry }) {
  const yearsAgo =
    new Date().getFullYear() - new Date(entry.visitedAt).getFullYear();

  return (
    <div className="mb-6 flex cursor-pointer items-center gap-3 rounded-[14px] border border-white/6 bg-[#2A1E0F] px-4 py-3.5">
      {/* icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F0E76F]/12">
        <Clock size={17} color="#F0E76F" />
      </div>

      {/* text */}
      <div className="flex-1">
        <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#F0E76F]">
          {yearsAgo} year{yearsAgo !== 1 ? "s" : ""} ago today
        </p>
        <p className="text-xs leading-snug text-white/70">
          You visited{" "}
          <span className="font-semibold text-white">
            {entry.restaurantName}
          </span>
          {entry.rating && (
            <>
              {" "}
              and rated it{" "}
              <span className="font-semibold text-[#E89951]">
                {entry.rating}★
              </span>
            </>
          )}
        </p>
      </div>

      <ChevronRight size={16} color="rgba(255,255,255,0.25)" />
    </div>
  );
}



export function HomePage() {
  const { data: entries, isLoading: loadingEntries } = useRecentEntries(10);
  const { data: restaurants } = useRestaurantLists();

  const [showVisitModal, setShowVisitModal] = useState(false);

  const totalPlaces = restaurants?.length ?? 0;
  const totalEntries = entries?.length ?? 0;
  const avgRating = avg(entries?.map((e) => e.rating) ?? []);
  const onThisDay = findOnThisDay(entries ?? []);
  const userName = "Sora"; // TODO: replace with value from auth context

  return (
    <>
      <div
        className="relative min-h-screen bg-[#F5F0E8]"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        {/* ── DARK HEADER BAND ─────────────────────────────────────── */}
        <div className="relative h-48 overflow-hidden bg-[#1C1107]">
          {/* Memphis geometry */}
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

          {/* Greeting + date */}
          <div className="relative z-10 mx-auto flex max-w-140 items-end justify-between px-5 pt-20 pb-7">
            <div>
              <p
                className="text-3xl font-light leading-tight text-white"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {getGreeting()},{" "}
                
                <span className="italic text-[#F0E76F]">{userName}</span> 👋
              </p>
              <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-white/55">Here's your food history at a glance.</p>
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

        <div className="mx-auto max-w-140 px-4 pb-28">
          <div className="relative z-20 mb-6 -mt-7 grid grid-cols-3 gap-2.5">
            <StatCard value={totalPlaces} label="Places Visited" icon={MapPin} iconColor="#e63922" iconBgColor="#fde8e5" />
            <StatCard value={totalEntries} label="Total Entries" icon={Clock} iconColor="#2b5fc4" iconBgColor="#e3eaf8" />
            <StatCard
              value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
              label="Avg Rating"
              icon={Star}
              iconColor="#B8960A"
              iconBgColor="#FEF6C7"
            />
          </div>

          {/* ON THIS DAY */}
          {onThisDay && (
            <>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-500">
                  On this day
                </span>
              </div>
              <OnThisDayBanner entry={onThisDay} />
            </>
          )}

          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
              Recent entries
            </span>
            <Link
              to="/entries"
              className="text-[11px] font-semibold text-[#E89951] no-underline"
            >
              See all →
            </Link>
          </div>

          {/* Loading */}
          {loadingEntries && (
            <p className="py-10 text-center text-sm text-stone-500">
              Loading your diary…
            </p>
          )}

          {/* Empty state */}
          {!loadingEntries && !entries?.length && (
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
                No entries yet
              </p>
              <p className="mb-4 text-xs text-stone-500">
                Tap the + button to log your first restaurant visit.
              </p>
              <button
                onClick={() => setShowVisitModal(true)}
                className="rounded-full bg-[#1C1107] px-6 py-2.5 text-xs font-semibold tracking-wide text-[#A5CF83]"
              >
                Log a visit
              </button>
            </div>
          )}

          {/* Feed */}
          <div className="flex flex-col gap-3">
            {entries?.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>

        {/* ── FAB ──────────────────────────────────────────────────── */}
        <button
          onClick={() => setShowVisitModal(true)}
          aria-label="Log a new visit"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1C1107] shadow-[0_4px_20px_rgba(28,17,7,0.35)] transition hover:scale-105"
        >
          <Plus size={24} color="#A5CF83" />
        </button>
      </div>
      {showVisitModal && (
        <Modal onClose={() => setShowVisitModal(false)}>
          <LogVisitForm
            restaurants={restaurants ?? []}
            onClose={() => setShowVisitModal(false)}
          />
        </Modal>
      )}
    </>
  );
}
