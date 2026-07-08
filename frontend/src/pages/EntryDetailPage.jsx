import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  MapPin,
  MessageSquareText,
  ReceiptText,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { useAllEntries } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1080px",
  width: "100%",
};

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-PH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? `Brgy. ${restaurant.barangay}` : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function EntryStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-[#F4B21B]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={20}
          fill={star <= (rating ?? 0) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function DetailTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#F5EEE4] p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-[#6F5130]">
        <Icon size={17} />
      </div>
      <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
        {label}
      </p>
      <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
        {value || "Not added"}
      </p>
    </div>
  );
}

export function EntryDetailPage() {
  const { id } = useParams();
  const { data: entries, isLoading } = useAllEntries();

  const entry = useMemo(
    () => entries?.find((item) => String(item.id) === String(id)),
    [entries, id],
  );

  const restaurant = entry?.restaurant;
  const location = getLocation(restaurant);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-16 text-center font-['Plus_Jakarta_Sans'] text-sm text-stone-500">
        Loading diary entry...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-16 text-center">
        <p
          className="mb-3 text-2xl text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          Diary entry not found
        </p>
        <Link
          to="/entries"
          className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#E89951] no-underline"
        >
          Back to entries
        </Link>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F5F0E8]"
      style={{ fontFamily: '"Geist Mono", monospace' }}
    >
      <header className="relative overflow-hidden bg-[#1C1107]">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-8 top-10 h-24 w-24 rounded-full border border-[#F0E76F]/15" />
          <div className="absolute right-14 top-8 h-28 w-28 rotate-12 rounded-[28px] border border-[#E89951]/15" />
          <div className="absolute bottom-0 left-1/3 h-24 w-56 rounded-t-full border border-[#A5CF83]/10" />
        </div>

        <div
          className="relative z-10 mx-auto px-4 pb-14 pt-8"
          style={pageShellStyle}
        >
          <Link
            to="/entries"
            className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white/70 no-underline transition hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            Entries
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <span className="mb-4 inline-flex rounded-full bg-[#F0E76F] px-3.5 py-1.5 font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase text-[#1C1107]">
                {categoryLabel(restaurant?.category, "Diary entry")}
              </span>
              <h1
                className="max-w-3xl text-5xl font-light leading-none text-white sm:text-6xl"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {restaurant?.name ?? "Food memory"}
              </h1>
              <p className="mt-4 max-w-2xl font-['Plus_Jakarta_Sans'] text-base leading-7 text-white/62">
                A single visit record with the photo, rating, place, date, and
                notes from that food memory.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/6 p-4 text-white shadow-[0_18px_46px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-white/50">
                Visit rating
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p
                  className="text-6xl font-light leading-none"
                  style={{ fontFamily: '"Fraunces", serif' }}
                >
                  {entry.rating ?? "-"}
                </p>
                <div className="pb-1">
                  <EntryStars rating={entry.rating} />
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs text-white/50">
                    {formatDate(entry.visitedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 pb-24" style={pageShellStyle}>
        <section className="relative z-20 -mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-3xl border border-[#E8DFC8] bg-[#FFFBF4] shadow-[0_12px_32px_rgba(28,17,7,0.05)]">
            {entry.photoUrl ? (
              <img
                src={entry.photoUrl}
                alt={entry.caption || restaurant?.name || "Food entry"}
                className="h-105 w-full object-cover"
              />
            ) : (
              <div className="flex h-105 w-full items-center justify-center bg-[#F5EEE4]">
                <Camera size={46} className="text-[#C8B89A]" />
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#E8DFC8] bg-[#FFFBF4] p-5 shadow-[0_12px_32px_rgba(28,17,7,0.05)]">
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase text-stone-500">
              Food diary note
            </p>
            <p
              className="mt-2 text-3xl font-light leading-tight text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {entry.caption || "No written note for this visit yet."}
            </p>

            <div className="mt-6 grid gap-3">
              <DetailTile
                icon={CalendarDays}
                label="Visited"
                value={formatDate(entry.visitedAt)}
              />
              <DetailTile
                icon={MapPin}
                label="Place"
                value={restaurant?.name}
              />
              <DetailTile
                icon={ReceiptText}
                label="Entry type"
                value="Food memory"
              />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-[#E8DFC8] bg-[#FFFBF4] p-5">
            <MessageSquareText size={19} className="mb-3 text-[#6F5130]" />
            <p
              className="text-2xl font-light text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              What to remember
            </p>
            <p className="mt-2 font-['Plus_Jakarta_Sans'] text-sm leading-6 text-stone-500">
              This is the personal note for one visit, separate from the public
              food place profile.
            </p>
          </div>

          <div className="rounded-3xl border border-[#E8DFC8] bg-[#FFFBF4] p-5">
            <UtensilsCrossed size={19} className="mb-3 text-[#6F5130]" />
            <p
              className="text-2xl font-light text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Place details
            </p>
            <p className="mt-2 font-['Plus_Jakarta_Sans'] text-sm leading-6 text-stone-500">
              {location || "No location added yet."}
            </p>
          </div>

          <Link
            to={`/place-details/${restaurant?.id ?? entry.restaurantId}`}
            className="rounded-3xl border border-[#E8DFC8] bg-[#1C1107] p-5 text-white no-underline transition hover:bg-[#2F3A4D]"
          >
            <ArrowLeft size={19} className="mb-3 rotate-180 text-[#F0E76F]" />
            <p
              className="text-2xl font-light"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              Open food place
            </p>
            <p className="mt-2 font-['Plus_Jakarta_Sans'] text-sm leading-6 text-white/55">
              See ratings, menu notes, address, visitor count, and entries for
              this place.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}
