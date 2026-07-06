import { useState } from 'react';
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Clock,
  ChevronRight,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { Modal, LogVisitForm } from "../components";
import { useRecentEntries, useMyRestaurants } from "../hooks/useDiaryData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  return `${mins}m ago`;
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

function categoryLabel(cat) {
  return cat ? cat.replace(/_/g, " ") : "Other";
}

// Category tag colours — kept as inline style since Tailwind can't
// generate arbitrary rgba() values from dynamic strings at runtime.
const categoryStyle = {
  restaurant: { background: "rgba(165,207,131,0.18)", color: "#3A6B1E" },
  fast_food: { background: "rgba(236,182,95,0.18)", color: "#7A4E0A" },
  cafe: { background: "rgba(240,231,111,0.18)", color: "#5C5008" },
  food_court: { background: "rgba(232,153,81,0.18)", color: "#7A3D08" },
};

function getCategoryStyle(cat) {
  return categoryStyle[cat] ?? categoryStyle.restaurant;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= rating ? "#E89951" : "none"}
          stroke={i <= rating ? "#E89951" : "#C8B89A"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function StatCard({ value, label, dotColor }) {
  return (
    <div className="flex-1 rounded-[14px] border border-[#E8DFC8] bg-[#FFFBF4] px-3 py-3.5">
      {/* coloured dot */}
      <div
        className="mb-2 h-2 w-2 rounded-full"
        style={{ background: dotColor }}
      />
      <p
        className="text-2xl font-semibold leading-none text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {value}
      </p>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#7A6A54]">
        {label}
      </p>
    </div>
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

function EntryCard({ entry }) {
  const tagStyle = getCategoryStyle(entry.category);

  return (
    <Link
      to={`/restaurants/${entry.restaurantId}`}
      className="block no-underline"
    >
      <div className="overflow-hidden rounded-2xl border border-[#E8DFC8] bg-[#FFFBF4]">
        {/* ── Photo / placeholder ── */}
        <div className="relative h-45 overflow-hidden">
          {entry.photoUrl ? (
            <img
              src={entry.photoUrl}
              alt={entry.restaurantName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2A1E0F] to-[#3D2E18]">
              <UtensilsCrossed size={40} color="rgba(255,255,255,0.15)" />
            </div>
          )}

          {/* category badge */}
          {entry.category && (
            <span className="absolute left-3 top-3 rounded-full bg-[#1C1107] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              {categoryLabel(entry.category)}
            </span>
          )}
        </div>

        {/* ── Card body ── */}
        <div className="px-4 py-3.5">
          {/* name + stars */}
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <p
              className="flex-1 text-lg font-normal leading-snug text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {entry.restaurantName}
            </p>
            <StarRow rating={entry.rating} />
          </div>

          {/* location */}
          {(entry.barangay || entry.city) && (
            <div className="mb-2 flex items-center gap-1 text-[11px] text-[#7A6A54]">
              <MapPin size={10} />
              <span>
                {[entry.barangay, entry.city, "Bataan"]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
          )}

          {/* caption */}
          {entry.caption && (
            <p className="mb-2.5 border-l-2 border-[#ECB65F] pl-2.5 text-xs italic leading-relaxed text-[#5A4A34]">
              {entry.caption.length > 100
                ? entry.caption.slice(0, 100) + "…"
                : entry.caption}
            </p>
          )}

          {/* footer */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wide text-[#7A6A54]">
              {timeAgo(entry.visitedAt)}
            </span>
            {/* rgba tag colour can't be a Tailwind class — use inline style */}
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest"
              style={tagStyle}
            >
              {categoryLabel(entry.category)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const { data: entries, isLoading: loadingEntries } = useRecentEntries(20);
  const { data: restaurants } = useMyRestaurants();
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

      {/* ── MAIN COLUMN ──────────────────────────────────────────── */}
      <div className="mx-auto max-w-140 px-4 pb-28">
        {/* STATS STRIP — negative margin floats it up into the header */}
        <div className="sticky top-14 z-30 mb-6 -mt-7 flex gap-2.5">
          <StatCard value={totalPlaces} label="Places" dotColor="#A5CF83" />
          <StatCard value={totalEntries} label="Entries" dotColor="#F0E76F" />
          <StatCard
            value={avgRating > 0 ? avgRating.toFixed(1) : "—"}
            label="Avg Rating"
            dotColor="#E89951"
          />
        </div>

        {/* ON THIS DAY */}
        {onThisDay && (
          <>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7A6A54]">
                On this day
              </span>
            </div>
            <OnThisDayBanner entry={onThisDay} />
          </>
        )}

        {/* RECENT ENTRIES header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7A6A54]">
            Recent entries
          </span>
          <Link
            to="/restaurants"
            className="text-[11px] font-semibold text-[#E89951] no-underline"
          >
            See all →
          </Link>
        </div>

        {/* Loading */}
        {loadingEntries && (
          <p className="py-10 text-center text-sm text-[#7A6A54]">
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
            <p className="mb-4 text-xs text-[#7A6A54]">
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
