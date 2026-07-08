import { Link } from "react-router-dom";
import { MapPin, Star, UtensilsCrossed } from "lucide-react";
import { categoryLabel } from "../utils/restaurants";

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? "Brgy. " + restaurant.barangay : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;

  return "Just Now";
}

export function EntryCard({ entry, featured = false }) {
  const restaurant = entry.restaurant;
  const location = getLocation(restaurant);

  const card = (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#EEF2F7] bg-white shadow-none ${
        featured
          ? "flex h-[clamp(25rem,64dvh,31rem)] flex-col"
          : "flex h-full flex-col transition hover:-translate-y-0.5"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured ? "h-[clamp(13rem,34dvh,18rem)]" : "h-56"
        }`}
      >
        {entry.photoUrl ? (
          <img
            src={entry.photoUrl}
            alt={restaurant?.name ?? "Restaurant photo"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2A1E0F] to-[#3D2E18]">
            <UtensilsCrossed size={40} color="rgba(255,255,255,0.15)" />
          </div>
        )}
      </div>

      <div
        className={`${
          featured
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4"
            : "flex min-h-0 flex-1 flex-col px-4 py-3.5"
        }`}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <p
            className={`line-clamp-2 min-w-0 flex-1 overflow-hidden font-normal leading-snug text-warmGray-900 ${
              featured ? "text-2xl" : "text-xl"
            }`}
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            {restaurant?.name ?? "Unknown restaurant"}
          </p>
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#253248]">
            <Star size={15} fill="#F4B21B" className="text-[#F4B21B]" />
            <p>
              {entry.rating != null ? Number(entry.rating).toFixed(1) : "-"}
            </p>
          </div>
        </div>

        <div className="flex min-h-5 items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs font-medium leading-5 text-[#6F7892]">
          <MapPin size={12} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate py-px">
            {location || "No Location"}
          </span>
        </div>

        <div className="mt-auto mb-3 max-h-[5rem] overflow-hidden">
          {entry.caption && (
            <p
              className={`border-l-2 border-[#DDE5EF] pl-2.5 font-['Plus_Jakarta_Sans'] text-sm text-[#5A4A34] ${
                featured
                  ? "line-clamp-3 leading-[1.6rem]"
                  : "mb-3 line-clamp-3 leading-[1.6rem]"
              }`}
            >
              {entry.caption}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3">
          <span className="text-[10px] tracking-wide text-stone-500">
            {timeAgo(entry.visitedAt)}
          </span>
          {restaurant?.category && (
            <span className="max-w-[55%] truncate rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
              {categoryLabel(restaurant.category)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (featured) {
    return (
      <div className="block h-full cursor-default no-underline">{card}</div>
    );
  }

  return (
    <Link to={`/entries/${entry.id}`} className="block h-full no-underline">
      {card}
    </Link>
  );
}
