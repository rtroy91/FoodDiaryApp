import { Link } from "react-router-dom";
import { MapPin, Star, UtensilsCrossed } from "lucide-react";

export function EntryCard({ entry }) {
  const restaurant = entry.restaurant;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    if (days >= 7) return `${Math.floor(days / 7)}w ago`;
    if (days >= 1) return `${days}d ago`;
    if (hrs >= 1) return `${hrs}h ago`;
    if (mins >= 1) return `${mins}m ago`;

    return "Now";
  };

  function categoryLabel(cat) {
    return cat ? cat.replace(/_/g, " ") : "Other";
  }

  return (
    <Link
      to={`/restaurants/${restaurant?.id ?? entry.restaurantId}`}
      className="block no-underline"
    >
      <div className="overflow-hidden rounded-2xl border border-stone-300 bg-stone-50">
        <div className="relative h-56 overflow-hidden">
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

        <div className="px-4 py-3.5">
          <div className="mb-1 flex items-start justify-between gap-3">
            <p
              className="min-w-0 flex-1 text-xl font-normal leading-snug text-warmGray-900"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {restaurant?.name ?? "Unknown restaurant"}
            </p>
            <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-yellow-500">
              <Star size={16} fill="currentColor" />
              <p>{entry.rating ?? "-"}</p>
            </div>
          </div>

          <div className="mb-3 flex items-start gap-1 text-xs text-stone-500">
            <MapPin size={10} className="mt-0.5 shrink-0" />
            <span className="min-w-0 leading-snug">
              {[
                restaurant?.barangay ? "Brgy. " + restaurant.barangay : null,
                restaurant?.city,
                restaurant?.province,
              ]
                .filter(Boolean)
                .join(", ") || "No Location"}
            </span>
          </div>

          {entry.caption && (
            <p className="mb-3 border-l-2 border-gray-300 pl-2.5 font-['Plus_Jakarta_Sans'] text-sm text-[#5A4A34]">
              {entry.caption.length > 100
                ? entry.caption.slice(0, 100) + "..."
                : entry.caption}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-wide text-stone-500">
              {timeAgo(entry.visitedAt)}
            </span>
            {restaurant?.category && (
              <span className="rounded-full bg-[#1C1107] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
                {categoryLabel(restaurant.category)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
