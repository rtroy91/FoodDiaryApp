import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Clock3,
  Flame,
  MapPin,
  MessageSquareText,
  Navigation,
  Star,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useEntries, useRestaurant } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1180px",
  width: "100%",
};

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? `Brgy. ${restaurant.barangay}` : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatDate(value) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function averageRating(entries = [], fallback) {
  const ratings = entries
    .map((entry) => entry.rating)
    .filter((rating) => typeof rating === "number");

  if (ratings.length) {
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  return fallback ?? null;
}

function getPhotoEntries(entries = []) {
  return entries.filter((entry) => entry.photoUrl).slice(0, 5);
}

function BentoCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-[#E8DFC8] bg-stone-50 p-5 shadow-[0_12px_32px_rgba(28,17,7,0.05)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase text-stone-500">
        {eyebrow}
      </p>
      <h2
        className="mt-1 text-2xl font-light leading-tight text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {title}
      </h2>
    </div>
  );
}

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-1 text-[#F4B21B]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={18}
          fill={star <= Math.round(rating ?? 0) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function HeaderPlaceImage({ imageUrl, name }) {
  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/6 shadow-[0_18px_46px_rgba(0,0,0,0.22)] backdrop-blur">
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <UtensilsCrossed size={36} className="text-[#F0E76F]" />
      )}
    </div>
  );
}

function buildMenuItems(restaurant, entries = []) {
  const photoEntries = entries.filter((entry) => entry.photoUrl).slice(0, 3);

  if (photoEntries.length) {
    return photoEntries.map((entry, index) => ({
      id: entry.id,
      name: entry.caption || `Menu photo ${index + 1}`,
      description: "From a visitor diary entry.",
      imageUrl: entry.photoUrl,
    }));
  }

  return [
    {
      id: "house-favorite",
      name: `${categoryLabel(restaurant?.category)} house favorite`,
      description: "Ready for a real menu photo.",
      imageUrl: null,
    },
    {
      id: "most-ordered",
      name: "Most ordered dish",
      description: "Will be based on visitor entries.",
      imageUrl: null,
    },
    {
      id: "new-menu",
      name: "New menu item",
      description: "Use this slot for specials or seasonal food.",
      imageUrl: null,
    },
  ];
}

function MenuPreview({ menuItems, onSelect }) {
  const primaryItem = menuItems[0];
  const visibleThumbs = menuItems.slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onSelect({ ...primaryItem, menuItems })}
      className="group w-full rounded-2xl bg-[#F5EEE4] p-3 text-left transition hover:bg-[#EFE5D8] focus:outline-none focus:ring-2 focus:ring-[#F0E76F]"
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {visibleThumbs.map((item) => (
            <div
              key={item.id}
              className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#F5EEE4] bg-[#E8DFC8]"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <UtensilsCrossed size={22} className="text-[#B9A98A]" />
              )}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
            View menu
          </p>
          <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
            Click to expand menu photos and saved menu notes.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1C1107] text-white transition group-hover:bg-[#2F3A4D]">
          <Camera size={17} />
        </div>
      </div>
    </button>
  );
}

function FoodHighlights({ photos = [] }) {
  if (!photos.length) {
    return (
      <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-[#F5EEE4] text-center">
        <Camera size={34} className="mb-3 text-[#C8B89A]" />
        <p className="font-['Plus_Jakarta_Sans'] text-sm text-stone-500">
          Food highlights will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {photos.map((entry, index) => (
        <div
          key={entry.id}
          className={`group overflow-hidden rounded-2xl bg-[#E8DFC8] ${
            index === 0 ? "col-span-2 h-48" : "h-28"
          }`}
        >
          <img
            src={entry.photoUrl}
            alt={entry.caption || "Food highlight"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {index === 0 && entry.caption && (
            <div className="pointer-events-none -mt-16 flex h-16 items-end bg-linear-to-t from-black/55 to-transparent p-3">
              <p className="line-clamp-1 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white">
                {entry.caption}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ExpandedMenuGrid({ menuItems }) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-3">
      {menuItems.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-2xl bg-[#F5EEE4]">
          <div className="flex h-40 items-center justify-center bg-[#E8DFC8]">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <UtensilsCrossed size={34} className="text-[#B9A98A]" />
            )}
          </div>
          <div className="p-3">
            <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
              {item.name}
            </p>
            <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MenuPhotoModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-[#FFFBF4] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-[#E8DFC8] px-5 py-4">
          <div className="min-w-0">
            <p className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold uppercase text-stone-500">
              Menu photo
            </p>
            <p
              className="truncate text-2xl font-light text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {item.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5EEE4] font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107] transition hover:bg-[#E8DFC8]"
            aria-label="Close menu photo"
          >
            X
          </button>
        </div>
        <ExpandedMenuGrid menuItems={item.menuItems ?? [item]} />
      </div>
    </div>
  );
}

function PlaceProfile({ restaurant, category, fullAddress, location }) {
  const openingHours =
    restaurant.openingHours ??
    restaurant.hours ??
    restaurant.businessHours ??
    "Opening hours not added yet";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[#F5EEE4] p-4 sm:col-span-2">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 text-[#6F5130]">
          <MapPin size={18} />
        </div>
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
          Address
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-base font-bold text-[#1C1107]">
          {fullAddress || "No address added yet"}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F5EEE4] p-4">
        <Navigation size={18} className="mb-3 text-[#6F5130]" />
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
          Area
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
          {location || restaurant.city || "No area added"}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F5EEE4] p-4">
        <UtensilsCrossed size={18} className="mb-3 text-[#6F5130]" />
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
          Category
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
          {category}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F5EEE4] p-4">
        <Clock3 size={18} className="mb-3 text-[#6F5130]" />
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
          Opening hours
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
          {openingHours}
        </p>
      </div>

      <div className="rounded-2xl bg-[#F5EEE4] p-4">
        <Wallet size={18} className="mb-3 text-[#6F5130]" />
        <p className="font-['Plus_Jakarta_Sans'] text-xs text-stone-500">
          Budget
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107]">
          {restaurant.priceRange || restaurant.budget || "₱₱ - Moderate"}
        </p>
      </div>
    </div>
  );
}

function VisitorSignal({ entries = [] }) {
  const captions = entries.map((entry) => entry.caption || "");
  const promo = captions.find((caption) =>
    /promo|discount|sale|deal|free|voucher/i.test(caption),
  );
  const newFood = captions.find((caption) =>
    /new|special|seasonal|limited|fresh/i.test(caption),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-[#FFF7D2] p-4">
        <Flame size={18} className="mb-3 text-[#9B6A12]" />
        <p
          className="text-2xl font-light text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          {promo ? "Promo spotted" : "No promo posted"}
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs leading-5 text-stone-500">
          {promo ||
            "Promos or discounts can appear here when added to entries."}
        </p>
      </div>
      <div className="rounded-2xl bg-[#F1F7EA] p-4">
        <TrendingUp size={18} className="mb-3 text-[#294B20]" />
        <p
          className="text-2xl font-light text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          {newFood ? "New food noted" : "No new food yet"}
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs leading-5 text-stone-500">
          {newFood || "New menu items and specials can be shown here."}
        </p>
      </div>
    </div>
  );
}

function EntryPreviewList({ entries = [], loading }) {
  if (loading) {
    return (
      <p className="rounded-2xl bg-[#F5EEE4] py-10 text-center font-['Plus_Jakarta_Sans'] text-sm text-stone-500">
        Loading food diary entries...
      </p>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-2xl bg-[#F5EEE4] px-5 py-10 text-center">
        <UtensilsCrossed size={34} className="mx-auto mb-3 text-[#C8B89A]" />
        <p
          className="text-xl font-light text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          No diary entries yet
        </p>
        <p className="mt-1 font-['Plus_Jakarta_Sans'] text-sm text-stone-500">
          Entries from visitors will appear here once they log this place.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.slice(0, 4).map((entry) => (
        <Link
          key={entry.id}
          to={`/entries/${entry.id}`}
          className="grid gap-3 rounded-2xl bg-[#F5EEE4] p-3 no-underline transition hover:bg-[#EFE5D8] sm:grid-cols-[96px_1fr]"
        >
          <div className="h-28 overflow-hidden rounded-xl bg-[#E8DFC8] sm:h-full">
            {entry.photoUrl ? (
              <img
                src={entry.photoUrl}
                alt={entry.caption || "Food diary entry"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Camera size={24} className="text-[#B9A98A]" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-['Plus_Jakarta_Sans'] text-xs font-semibold text-stone-500">
                {formatDate(entry.visitedAt)}
              </p>
              <span className="inline-flex items-center gap-1 font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#B8960A]">
                <Star size={14} fill="currentColor" />
                {entry.rating ?? "-"}
              </span>
            </div>
            <p
              className="line-clamp-2 text-xl font-light leading-snug text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {entry.caption || "No written note for this visit."}
            </p>
            <p className="mt-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#E89951]">
              View entry
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function FoodPlaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurant(id);
  const { data: entries, isLoading: loadingEntries } = useEntries(id);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);

  const sortedEntries = useMemo(
    () =>
      [...(entries ?? [])].sort(
        (a, b) =>
          new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime(),
      ),
    [entries],
  );

  const location = getLocation(restaurant);
  const fullAddress = [restaurant?.address, location]
    .filter(Boolean)
    .join(", ");
  const photos = getPhotoEntries(sortedEntries);
  const avg = averageRating(sortedEntries, restaurant?.averageRating);
  const visitorCount = sortedEntries.length || restaurant?.visitCount || 0;
  const category = categoryLabel(restaurant?.category);
  const menuItems = useMemo(
    () => buildMenuItems(restaurant, sortedEntries),
    [restaurant, sortedEntries],
  );

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/top-places", { replace: true });
  }

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-16 text-center font-['Plus_Jakarta_Sans'] text-sm text-stone-500">
        Loading food place...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] px-4 py-16 text-center">
        <p
          className="mb-3 text-2xl text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          Food place not found
        </p>
        <Link
          to="/top-places"
          className="font-['Plus_Jakarta_Sans'] text-sm font-semibold text-[#E89951] no-underline"
        >
          Back to Top Places
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
          <div className="absolute left-10 top-12 h-20 w-20 rounded-full border border-[#F0E76F]/15" />
          <div className="absolute right-12 top-8 h-30 w-30 rotate-12 rounded-[30px] border border-[#E89951]/15" />
          <div className="absolute bottom-0 left-1/3 h-24 w-64 rounded-t-full border border-[#A5CF83]/10" />
        </div>

        <div
          className="relative z-10 mx-auto px-4 pb-14 pt-8"
          style={pageShellStyle}
        >
          <button
            type="button"
            onClick={handleBack}
            className="mb-9 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-white/70 no-underline transition hover:bg-white/10"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <HeaderPlaceImage
                imageUrl={photos[0]?.photoUrl}
                name={restaurant.name}
              />
              <h1
                className="max-w-3xl text-5xl font-light leading-none text-white sm:text-6xl"
                style={{ fontFamily: '"Fraunces", serif' }}
              >
                {restaurant.name}
              </h1>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/6 p-4 text-white shadow-[0_18px_46px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="font-['Plus_Jakarta_Sans'] text-xs text-white/50">
                Overall rating
              </p>
              <div className="mt-2 flex items-end gap-3">
                <p
                  className="text-6xl font-light leading-none"
                  style={{ fontFamily: '"Fraunces", serif' }}
                >
                  {avg != null ? avg.toFixed(1) : "-"}
                </p>
                <div className="pb-1">
                  <RatingStars rating={avg} />
                  <p className="mt-1 font-['Plus_Jakarta_Sans'] text-xs text-white/50">
                    {visitorCount} {visitorCount === 1 ? "visitor" : "visitors"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 pb-24 pt-8" style={pageShellStyle}>
        <div className="grid auto-rows-auto gap-5 lg:grid-cols-12">
          <BentoCard className="lg:col-span-8">
            <SectionLabel eyebrow="THE ESSENTIALS" title="Directory Details" />
            <PlaceProfile
              restaurant={restaurant}
              category={category}
              fullAddress={fullAddress}
              location={location}
            />
          </BentoCard>

          <BentoCard className="lg:col-span-4">
            <SectionLabel eyebrow="GALLERY" title="Guest Highlights" />
            <FoodHighlights photos={photos} />
          </BentoCard>

          <BentoCard className="lg:col-span-6">
            <SectionLabel eyebrow="DISHES" title="On the Menu" />
            <MenuPreview menuItems={menuItems} onSelect={setSelectedMenuItem} />
          </BentoCard>

          <BentoCard className="lg:col-span-6">
            <SectionLabel eyebrow="LIVE FEED" title="Active Deals & Promos" />
            <VisitorSignal entries={sortedEntries} />
          </BentoCard>

          <BentoCard className="lg:col-span-12">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SectionLabel
                eyebrow="Food diary"
                title="Entries from visitors"
              />
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-[#F5EEE4] px-3 py-1.5 font-['Plus_Jakarta_Sans'] text-xs font-semibold text-[#5A4A34] sm:self-auto">
                <MessageSquareText size={14} />
                {sortedEntries.length} posted
              </span>
            </div>
            <EntryPreviewList
              entries={sortedEntries}
              loading={loadingEntries}
            />
          </BentoCard>
        </div>
      </main>

      <MenuPhotoModal
        item={selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
      />
    </div>
  );
}
