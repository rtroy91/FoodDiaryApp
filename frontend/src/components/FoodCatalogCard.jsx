import { Link } from "react-router-dom";
import { ImageIcon, MapPin, Star, UtensilsCrossed } from "lucide-react";
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

function formatReach(value = 0) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }

  return value.toString();
}

function getThumbnailUrl(restaurant) {
  return (
    restaurant?.thumbnailUrl ??
    restaurant?.photoUrl ??
    restaurant?.imageUrl ??
    restaurant?.coverPhotoUrl ??
    null
  );
}

function FoodCatalogCardContent({ restaurant }) {
  const location = getLocation(restaurant);
  const rating = restaurant.averageRating;
  const reach = restaurant.visitCount ?? 0;
  const thumbnailUrl = getThumbnailUrl(restaurant);
  const category = categoryLabel(restaurant.category);

  return (
    <>
      <div className="h-20 w-20 overflow-hidden rounded-xl border border-stone-100 bg-[#F5EEE4]">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-400">
            <UtensilsCrossed size={22} />
            <ImageIcon size={14} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center text-left">
        <div className="min-w-0">
          <div className="mb-1 flex min-w-0 items-start gap-3">
            <h3 className="min-w-0 flex-1 truncate text-base font-semibold leading-snug text-stone-900 md:text-lg">
              {restaurant.name}
            </h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-amber-500">
              <Star size={14} fill="currentColor" />
              {rating != null ? rating.toFixed(1) : "-"}
            </span>
          </div>

          <div className="mt-2 space-y-1 font-['Plus_Jakarta_Sans'] text-xs font-medium text-stone-500">
            {location && (
              <p className="flex min-w-0 items-center gap-1.5">
                <MapPin size={13} className="shrink-0 text-stone-400" />
                <span className="truncate">{location}</span>
              </p>
            )}
            <p>
              {formatReach(reach)} {reach === 1 ? "diner" : "diners"} visited
            </p>
          </div>
        </div>

        <span className="mt-3 w-fit max-w-full truncate rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3 py-0.5 font-['Plus_Jakarta_Sans'] text-[10px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
          {category}
        </span>
      </div>
    </>
  );
}

export function FoodCatalogCard({
  restaurant,
  compact = false,
  isSelected = false,
  onSelect,
}) {
  const cardClassName = [
    "grid w-full min-w-0 cursor-pointer grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl border bg-white px-3 py-2.5 text-left shadow-none transition-all hover:bg-stone-50",
    isSelected
      ? "border-[#E04B39]/40 ring-2 ring-[#E04B39]/10"
      : "border-stone-100",
    onSelect ? "outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/25" : "",
  ].join(" ");

  function handleKeyDown(event) {
    if (!onSelect) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(restaurant.id);
    }
  }

  if (onSelect) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={() => onSelect(restaurant.id)}
        onKeyDown={handleKeyDown}
        className={cardClassName}
      >
        <FoodCatalogCardContent restaurant={restaurant} compact={compact} />
      </article>
    );
  }

  return (
    <Link
      to={`/place-details/${restaurant.id}`}
      className="block min-w-0 no-underline"
    >
      <div className={cardClassName}>
        <FoodCatalogCardContent restaurant={restaurant} compact={compact} />
      </div>
    </Link>
  );
}
