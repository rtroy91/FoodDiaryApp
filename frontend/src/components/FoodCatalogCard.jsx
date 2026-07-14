import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ImageIcon, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { isAdmin } from "../api/auth";
import { categoryLabel } from "../utils/restaurants";

function getLocation(restaurant) {
  return [restaurant?.barangay ? "Brgy. " + restaurant.barangay : null, restaurant?.city, restaurant?.province]
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
    restaurant?.storePhotoUrl ??
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
  const visitsLabel = `${formatReach(reach)} ${reach > 1 ? "visits" : "visit"}`;

  return (
    <>
      <div className="h-20 w-20 overflow-hidden rounded-xl border border-stone-100 bg-[#F5EEE4]">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={restaurant.name} loading="eager" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-stone-600">
            <UtensilsCrossed size={22} />
            <ImageIcon size={14} />
          </div>
        )}
      </div>

      <div className="min-w-0 text-left">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 pt-0.5">
            <h3 className="min-w-0 flex-1 truncate text-base font-['Fraunces'] font-semibold leading-snug text-stone-900 md:text-lg">
              {restaurant.name}
            </h3>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              <Star size={12} fill="currentColor" />
              {rating != null ? rating.toFixed(1) : "-"}
            </span>
            <span className="inline-flex rounded-full bg-[#E8F7D3] px-2.5 py-1 text-xs font-bold leading-none text-[#365314]">
              {visitsLabel}
            </span>
          </div>
        </div>

        <div className="mt-1 space-y-1 text-xs font-medium text-stone-600">
          {location && (
            <p className="flex min-w-0 items-center gap-1.5">
              <MapPin size={13} className="shrink-0 text-stone-600" />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        <span className="mt-3 inline-flex max-w-full truncate rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3 py-0.5  text-[10px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
          {category}
        </span>
      </div>
    </>
  );
}

export function FoodCatalogCardSkeleton() {
  return (
    <article
      className="grid min-h-29 w-full min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl border border-stone-100 bg-white px-3.5 py-3.5 text-left shadow-none"
      aria-hidden="true"
    >
      <Skeleton width={72} height={72} borderRadius={12} baseColor="#e7dfd2" highlightColor="#f8f4ec" />

      <div className="min-w-0 text-left">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 pt-0.5">
            <Skeleton
              className="block"
              width={150}
              height={20}
              borderRadius={6}
              baseColor="#e7dfd2"
              highlightColor="#f8f4ec"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
              <Star size={12} fill="currentColor" />
              <Skeleton width={24} height={14} borderRadius={6} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
            </span>
            <Skeleton width={68} height={22} borderRadius={999} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin size={13} className="shrink-0 text-stone-600" />
            <Skeleton width={180} height={12} borderRadius={6} baseColor="#f0ebe2" highlightColor="#fbf8f2" />
          </div>
        </div>

        <Skeleton
          className="mt-4 block"
          width={72}
          height={18}
          borderRadius={999}
          baseColor="#e7dfd2"
          highlightColor="#f8f4ec"
        />
      </div>
    </article>
  );
}

export function FoodCatalogCard({ restaurant, isSelected = false, onSelect }) {
  const to = isAdmin() ? `/place-details/${restaurant.id}` : `/entries/place/${restaurant.id}`;
  const cardClassName = [
    "grid w-full min-w-0 cursor-pointer grid-cols-[5rem_minmax(0,1fr)] items-center gap-4 overflow-hidden rounded-2xl border bg-white px-3 py-2.5 text-left shadow-none transition-all hover:bg-stone-50",
    isSelected ? "border-[#E04B39]/40 ring-2 ring-[#E04B39]/10" : "border-stone-100",
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
        aria-label={`Select ${restaurant.name}`}
        onClick={() => onSelect(restaurant.id)}
        onKeyDown={handleKeyDown}
        className={cardClassName}
      >
        <FoodCatalogCardContent restaurant={restaurant} />
      </article>
    );
  }

  return (
    <Link to={to} className="block min-w-0 no-underline">
      <div className={cardClassName}>
        <FoodCatalogCardContent restaurant={restaurant} />
      </div>
    </Link>
  );
}
