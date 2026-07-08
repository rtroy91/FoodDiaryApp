import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Star } from "lucide-react";
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

function FoodPlaceCardContent({
  restaurant,
  compact = false,
  showViewLink = false,
}) {
  const location = getLocation(restaurant);
  const rating = restaurant.averageRating;
  const reach = restaurant.visitCount ?? 0;

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
          {categoryLabel(restaurant.category)}
        </span>

        <h3 className="max-w-full text-xl font-medium leading-snug text-warmGray-900">
          {restaurant.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-xs font-['Plus_Jakarta_Sans'] font-medium text-[#6F7892]">
          {location && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={12} className="mt-0.5 shrink-0" />
              {location}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4 text-sm font-semibold text-[#253248]">
        <span className="inline-flex items-center gap-1.5">
          <Star size={15} fill="#F4B21B" className="text-[#F4B21B]" />
          {rating != null ? rating.toFixed(1) : "-"}
        </span>

        <span className="h-1 w-1 rounded-full bg-[#C8D0DC]" />

        <p>
          {formatReach(reach)} {reach > 1 ? "diners" : "diner"}
        </p>
      </div>

      {!compact && (
        <div className="mt-5">
          {showViewLink ? (
            <Link
              to={`/place-details/${restaurant.id}`}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto flex min-h-10 w-full max-w-38 items-center justify-center gap-2 rounded-xl bg-[#2F3A4D] px-4 py-2.5 text-sm font-bold text-white no-underline shadow-[0_8px_18px_rgba(47,58,77,0.16)] transition hover:bg-[#253248]"
            >
              View
              <ArrowRight size={15} />
            </Link>
          ) : (
            <span className="mx-auto flex min-h-10 w-full max-w-38 items-center justify-center gap-2 rounded-xl bg-[#2F3A4D] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(47,58,77,0.16)]">
              View
              <ArrowRight size={15} />
            </span>
          )}
        </div>
      )}
    </>
  );
}

export function FoodPlaceCard({
  restaurant,
  compact = false,
  isSelected = false,
  onSelect,
}) {
  const cardClassName = [
    "flex h-full flex-col rounded-[20px] border bg-white px-6 py-5 shadow-none transition hover:-translate-y-0.5 hover:shadow-none",
    isSelected ? "border-2 border-[#E04B39]/20" : "border-[#EEF2F7]",
    onSelect ? "outline-none" : "",
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
        <FoodPlaceCardContent
          restaurant={restaurant}
          compact={compact}
          showViewLink
        />
      </article>
    );
  }

  return (
    <Link
      to={`/place-details/${restaurant.id}`}
      className="block h-full no-underline"
    >
      <div className={cardClassName}>
        <FoodPlaceCardContent restaurant={restaurant} compact={compact} />
      </div>
    </Link>
  );
}
