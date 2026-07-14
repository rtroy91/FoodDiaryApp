import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  Clock3,
  Edit3,
  Flame,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Star,
  TrendingUp,
  Trash2,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useDeleteRestaurant, useEntries, useRestaurant } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";
import { Modal } from "../components/Modal";
import { RestaurantForm } from "../components/RestaurantForm";
import { isAdmin } from "../api/auth";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1240px",
  width: "100%",
};

function getLocation(restaurant) {
  return [restaurant?.barangay ? `Brgy. ${restaurant.barangay}` : null, restaurant?.city, restaurant?.province]
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
  const ratings = entries.map((entry) => entry.rating).filter((rating) => typeof rating === "number");

  if (ratings.length) {
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  return fallback ?? null;
}

function getPhotoEntries(entries = [], restaurant) {
  const storePhoto = restaurant?.storePhotoUrl
    ? [
        {
          id: "store-photo",
          photoUrl: restaurant.storePhotoUrl,
          caption: `${restaurant.name} storefront`,
        },
      ]
    : [];

  return [...storePhoto, ...entries.filter((entry) => entry.photoUrl)].slice(0, 6);
}

function BentoCard({ children, className = "" }) {
  return (
    <section
      className={`rounded-[28px] border border-[#E8DFC8] p-5 shadow-[0_16px_38px_rgba(28,17,7,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8C7B6A]">{eyebrow}</p>
      <h2
        className="mt-1 text-2xl font-normal leading-tight text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {title}
      </h2>
    </div>
  );
}

function RatingStars({ rating, size = 18 }) {
  return (
    <div className="flex items-center gap-1 text-[#F4B21B]">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} size={size} fill={star <= Math.round(rating ?? 0) ? "currentColor" : "none"} />
      ))}
    </div>
  );
}

function ImageFallback({ label, dark = false, className = "" }) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${
        dark ? "bg-white/8" : "bg-[#E8DFC8]"
      } ${className}`}
    >
      <div
        className={`absolute h-20 w-20 animate-pulse rounded-full border ${
          dark ? "border-white/15" : "border-[#C8B89A]/50"
        }`}
      />
      <div className={`absolute h-10 w-28 -rotate-12 rounded-full ${dark ? "bg-white/8" : "bg-white/40"}`} />
      <UtensilsCrossed
        size={34}
        className={dark ? "relative text-[#F0E76F]" : "relative text-[#9B8B72]"}
        aria-label={label}
      />
    </div>
  );
}

function buildMenuItems(restaurant, entries = []) {
  const photoEntries = entries.filter((entry) => entry.photoUrl).slice(0, 4);
  const savedMenuPhoto = restaurant?.menuPhotoUrl
    ? [
        {
          id: "menu-photo",
          name: "Menu photo",
          description: "Uploaded with this food place.",
          imageUrl: restaurant.menuPhotoUrl,
          score: 92,
        },
      ]
    : [];

  if (savedMenuPhoto.length || photoEntries.length) {
    return [
      ...savedMenuPhoto,
      ...photoEntries.map((entry, index) => ({
        id: entry.id,
        name: entry.caption || `Menu photo ${index + 1}`,
        description: "From a visitor diary entry.",
        imageUrl: entry.photoUrl,
        score: Math.max(44, 92 - index * 13),
      })),
    ];
  }

  return [
    {
      id: "house-favorite",
      name: `${categoryLabel(restaurant?.category)} house favorite`,
      description: "Ready for a real menu photo.",
      imageUrl: null,
      score: 86,
    },
    {
      id: "most-ordered",
      name: "Most ordered dish",
      description: "Will be based on visitor entries.",
      imageUrl: null,
      score: 68,
    },
    {
      id: "new-menu",
      name: "New menu item",
      description: "Use this slot for specials or seasonal food.",
      imageUrl: null,
      score: 52,
    },
  ];
}

function MenuPreview({ menuItems, expanded, onToggle }) {
  const primaryItem = menuItems[0];
  const visibleItems = expanded ? menuItems : menuItems.slice(0, 3);

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="group w-full rounded-3xl bg-[#F5EEE4] p-3 text-left transition hover:bg-[#EFE5D8] focus:outline-none focus:ring-2 focus:ring-[#E89951]/45"
      >
        <div className="grid gap-3 sm:grid-cols-[96px_1fr_auto] sm:items-center">
          <div className="h-24 overflow-hidden rounded-[20px] bg-[#E8DFC8]">
            {primaryItem?.imageUrl ? (
              <img
                src={primaryItem.imageUrl}
                alt={primaryItem.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <ImageFallback label="Menu preview" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#8C7B6A]">Menu preview</p>
            <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-[#1C1107]">
              {primaryItem?.name || "Featured dishes"}
            </p>
            <p className="mt-1 text-xs leading-5 text-stone-500">
              {primaryItem?.description || "Food notes will appear here."}
            </p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1C1107] text-white transition group-hover:bg-[#2F3A4D]">
            <ChevronDown size={18} className={`transition ${expanded ? "rotate-180" : ""}`} />
          </span>
        </div>
      </button>

      <div className="mt-4 grid gap-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="rounded-[20px] border border-[#E8DFC8] bg-white p-3">
            <div className="flex items-start gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[#E8DFC8]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <ImageFallback label={item.name} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-bold text-[#1C1107]">{item.name}</p>
                <p className="mt-1 line-clamp-1 text-xs text-stone-500">{item.description}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F5EEE4]">
                  <div className="h-full rounded-full bg-[#E89951]" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceActions({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsidePointerDown(e) {
      if (!menuRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown, true);
  }, [isOpen]);

  function handleEdit() {
    setIsOpen(false);
    onEdit?.();
  }

  function handleDelete() {
    setIsOpen(false);
    onDelete?.();
  }

  return (
    <div ref={menuRef} className="relative z-20 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0E76F]"
        aria-label="Place actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={17} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-40 overflow-hidden rounded-2xl border border-white/70 bg-white/95 py-1.5 shadow-[0_14px_38px_rgba(28,17,7,0.18)] backdrop-blur">
          <button
            type="button"
            onClick={handleEdit}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-bold text-[#1C1107] transition hover:bg-[#F7EFE5]"
          >
            <Edit3 size={15} />
            Edit
          </button>
          <div className="mx-3 my-1 h-px bg-[#EFE4D5]" />
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-bold text-[#D33B2F] transition hover:bg-[#FFF2E8]"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function DeletePlaceSheet({ restaurant, onCancel, onDeleted }) {
  const deleteRestaurant = useDeleteRestaurant();

  async function handleDelete() {
    try {
      await deleteRestaurant.mutateAsync(restaurant.id);
      onDeleted?.();
    } catch {
      // The inline error state keeps the confirmation sheet open for retry.
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-[#FFFDF9] p-5 shadow-[0_20px_70px_rgba(28,17,7,0.18)]">
      <h2 className="text-lg font-extrabold tracking-tight text-[#1C1107]">Delete Place?</h2>
      <p className="mt-3 text-sm leading-6 text-[#756450]">
        Are you sure you want to delete {restaurant.name}? This will also remove diary entries linked to this place.
      </p>
      {deleteRestaurant.isError && (
        <p className="mt-3 text-sm font-semibold text-[#E04B39]">We couldn't delete this place. Please try again.</p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteRestaurant.isPending}
        className="mt-5 w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(224,75,57,0.25)] transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deleteRestaurant.isPending ? "Deleting..." : "Delete Place"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={deleteRestaurant.isPending}
        className="mt-3 w-full py-2 text-sm font-extrabold text-[#756450] transition hover:text-[#1C1107] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
}

function FoodHighlights({ photos = [] }) {
  if (!photos.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl bg-[#F5EEE4] text-center">
        <Camera size={34} className="mb-3 text-[#C8B89A]" />
        <p className="text-sm text-stone-500">Food highlights will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {photos.slice(0, 5).map((entry, index) => (
        <div
          key={entry.id}
          className={`group relative overflow-hidden rounded-3xl bg-[#E8DFC8] ${
            index === 0 ? "col-span-2 h-72 md:row-span-2 md:h-full" : "h-34 md:h-40"
          }`}
        >
          <img
            src={entry.photoUrl}
            alt={entry.caption || "Food highlight"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {entry.caption && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-16 items-end bg-linear-to-t from-black/65 to-transparent p-3">
              <p className="line-clamp-2 text-xs font-semibold leading-5 text-white">{entry.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function DetailTile({ icon: Icon, label, value, compact = false, className = "" }) {
  if (compact) {
    return (
      <div className={`flex items-start gap-3 rounded-2xl bg-[#F5EEE4] px-3 py-2.5 ${className}`}>
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#6F5130]">
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-stone-500">{label}</p>
          <div className="mt-0.5 text-sm font-bold leading-5 text-[#1C1107]">{value || "Not added"}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[22px] bg-[#F5EEE4] p-4 ${className}`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-[#6F5130]">
        <Icon size={18} />
      </div>
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <div className="mt-1 text-sm font-bold leading-5 text-[#1C1107]">{value || "Not added"}</div>
    </div>
  );
}

function AddressTile({ value, restaurantId, className = "" }) {
  return (
    <Link
      to={`/food-map?placeId=${restaurantId}`}
      className={`group relative flex items-start gap-3 rounded-2xl bg-[#F5EEE4] px-3 py-2.5 text-[#1C1107] no-underline transition hover:bg-[#EFE5D8] ${className}`}
      title="View on map"
      aria-label="View address on map"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#6F5130]">
        <MapPin size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-stone-500">Address</p>
        <div className="mt-0.5 text-sm font-bold leading-5 text-[#1C1107]">{value || "Not added"}</div>
      </div>
    </Link>
  );
}

const OPENING_DAY_LABELS = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

function formatOpeningHours(value) {
  if (!Array.isArray(value)) return value;
  if (!value.length) return "N/A";

  return [...value]
    .sort((a, b) => a.day - b.day)
    .map((item) => ({
      day: OPENING_DAY_LABELS[item.day] ?? `Day ${item.day}`,
      hours: item.open && item.close ? `${item.open} - ${item.close}` : "Closed",
      isClosed: !item.open || !item.close,
    }));
}

function OpeningHoursValue({ value }) {
  if (typeof value === "string") return value;

  return (
    <div className="grid gap-1.5">
      {value.map((item) => (
        <div key={item.day} className="grid grid-cols-[2.25rem_1fr] items-baseline gap-2 text-xs leading-4">
          <span className="font-extrabold text-[#1C1107]">{item.day}</span>
          <span className={item.isClosed ? "font-semibold text-stone-500" : "font-bold text-[#1C1107]"}>
            {item.hours}
          </span>
        </div>
      ))}
    </div>
  );
}

function BudgetValue({ value }) {
  if (!value) return "N/A";

  const match = value.match(/^(.*?)\s*(\(.*\))$/);
  if (!match) return value;

  return (
    <span>
      <span>{match[1].trim()}</span>
      <span className="block">{match[2]}</span>
    </span>
  );
}

function PlaceProfile({ restaurant, category, fullAddress }) {
  const openingHours =
    formatOpeningHours(restaurant.openingHours) ?? restaurant.hours ?? restaurant.businessHours ?? "N/A";

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <AddressTile value={fullAddress || "N/A"} restaurantId={restaurant.id} className="sm:col-span-2" />
      <DetailTile icon={UtensilsCrossed} label="Category" value={category} compact />
      <DetailTile
        icon={Clock3}
        label="Opening hours"
        value={<OpeningHoursValue value={openingHours} />}
        compact
        className="sm:row-span-2"
      />
      <DetailTile
        icon={Wallet}
        label="Budget"
        value={<BudgetValue value={restaurant.priceRange || restaurant.budget} />}
        compact
      />
    </div>
  );
}

function VisitorSignal({ entries = [], restaurantPromo }) {
  const captions = entries.map((entry) => entry.caption || "");
  const promo = restaurantPromo || captions.find((caption) => /promo|discount|sale|deal|free|voucher/i.test(caption));
  const newFood = captions.find((caption) => /new|special|seasonal|limited|fresh/i.test(caption));

  return (
    <div className="grid gap-3">
      <div className="rounded-[22px] bg-[#FFF7D2] p-4">
        <Flame size={18} className="mb-3 text-[#9B6A12]" />
        <p className="text-2xl font-normal text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
          {promo ? "Promo spotted" : "No promo posted"}
        </p>
        <p className="mt-1 text-xs leading-5 text-stone-600">
          {promo || "Promos or discounts can appear here when added."}
        </p>
      </div>
      <div className="rounded-[22px] bg-[#F1F7EA] p-4">
        <TrendingUp size={18} className="mb-3 text-[#294B20]" />
        <p className="text-2xl font-normal text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
          {newFood ? "New food noted" : "No new food yet"}
        </p>
        <p className="mt-1 text-xs leading-5 text-stone-600">
          {newFood || "New menu items and specials can be shown here."}
        </p>
      </div>
    </div>
  );
}

function EntryPreviewList({ entries = [], loading }) {
  if (loading) {
    return (
      <p className="rounded-3xl bg-[#F5EEE4] py-10 text-center text-sm text-stone-500">Loading food diary entries...</p>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-3xl bg-[#F5EEE4] px-5 py-10 text-center">
        <UtensilsCrossed size={34} className="mx-auto mb-3 text-[#C8B89A]" />
        <p className="text-xl font-normal text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
          No diary entries yet
        </p>
        <p className="mt-1 text-sm text-stone-500">Entries from visitors will appear here once they log this place.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {entries.slice(0, 6).map((entry) => (
        <Link
          key={entry.id}
          to={`/entries/${entry.id}`}
          className="grid gap-3 rounded-3xl bg-[#F5EEE4] p-3 no-underline transition hover:bg-[#EFE5D8] sm:grid-cols-[104px_1fr]"
        >
          <div className="h-30 overflow-hidden rounded-[18px] bg-[#E8DFC8] sm:h-full">
            {entry.photoUrl ? (
              <img
                src={entry.photoUrl}
                alt={entry.caption || "Food diary entry"}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageFallback label="Food diary entry" />
            )}
          </div>
          <div className="min-w-0 py-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-stone-500">{formatDate(entry.visitedAt)}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#B8960A]">
                <Star size={14} fill="currentColor" />
                {entry.rating ?? "-"}
              </span>
            </div>
            <p
              className="line-clamp-2 text-xl font-normal leading-snug text-[#1C1107]"
              style={{ fontFamily: '"Fraunces", serif' }}
            >
              {entry.caption || "No written note for this visit."}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[#E89951]">View entry</p>
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
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [isEditingPlace, setIsEditingPlace] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const canViewPlaceDetail = isAdmin();

  const sortedEntries = useMemo(
    () => [...(entries ?? [])].sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()),
    [entries]
  );

  const location = getLocation(restaurant);
  const fullAddress = [restaurant?.address, location].filter(Boolean).join(", ");
  const photos = getPhotoEntries(sortedEntries, restaurant);
  const avg = averageRating(sortedEntries, restaurant?.averageRating);
  const category = categoryLabel(restaurant?.category);
  const menuItems = useMemo(() => buildMenuItems(restaurant, sortedEntries), [restaurant, sortedEntries]);

  function handleBack() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/top-places", { replace: true });
  }

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-4 py-16 text-center text-sm text-stone-500">
        Loading food place...
      </div>
    );
  }

  if (!canViewPlaceDetail && loadingEntries) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-4 py-16 text-center text-sm text-stone-500">
        Opening diary entry...
      </div>
    );
  }

  if (!canViewPlaceDetail) {
    const firstEntry = sortedEntries[0];
    return <Navigate to={firstEntry ? `/entries/${firstEntry.id}` : `/entries/place/${restaurant.id}`} replace />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-4 py-16 text-center">
        <p className="mb-3 text-2xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
          Food place not found
        </p>
        <Link to="/top-places" className="text-sm font-semibold text-[#E89951] no-underline">
          Back to Top Places
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#FDFBF7] text-[#1C1107] antialiased">
        <header className="relative overflow-hidden border-b border-[#E8DFC8] bg-[#1C1107] text-white">
          <div className="food-place-hero-shell mx-auto px-5 py-10 lg:px-6 lg:py-16" style={pageShellStyle}>
            <div className="food-place-hero-copy lg:col-span-2">
              <div className="mb-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="group inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15"
                >
                  <ArrowLeft className="shrink-0 transition-transform group-hover:-translate-x-0.5" size={14} />
                  Return to Places
                </button>

                <PlaceActions onEdit={() => setIsEditingPlace(true)} onDelete={() => setIsConfirmingDelete(true)} />
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="mt-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/8 text-[#F0E76F]">
                    {restaurant.storePhotoUrl ? (
                      <img
                        src={restaurant.storePhotoUrl}
                        alt={`${restaurant.name} store icon`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={28} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h1
                      className="min-w-0 max-w-4xl text-5xl font-normal leading-none text-white sm:text-6xl lg:text-7xl"
                      style={{ fontFamily: '"Fraunces", serif' }}
                    >
                      {restaurant.name}
                    </h1>
                    {(location || restaurant.city) && (
                      <p className="mt-3 flex items-center gap-2 text-sm font-semibold leading-5 text-white/65 sm:text-base">
                        <MapPin size={16} className="shrink-0 text-[#F0E76F]" />
                        <span>{location || restaurant.city}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur lg:justify-self-end">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Community rating</p>
                  <div className="mt-2 flex items-baseline gap-4">
                    <span className="text-7xl font-normal leading-none" style={{ fontFamily: '"Fraunces", serif' }}>
                      {avg != null ? avg.toFixed(1) : "-"}
                    </span>
                    <div>
                      <RatingStars rating={avg} />
                      <p className="mt-1 text-xs text-stone-400">Based on authentic diary entries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto px-5 py-10 lg:px-6 lg:py-12" style={pageShellStyle}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12">
            <BentoCard className="bg-white p-4 md:col-span-2 lg:col-span-5">
              <SectionLabel title="Directory Information" />
              <PlaceProfile restaurant={restaurant} category={category} fullAddress={fullAddress} />
            </BentoCard>

            <BentoCard className="bg-white md:col-span-2 lg:col-span-7">
              <SectionLabel title="Photo Highlights" />
              <FoodHighlights photos={photos} />
            </BentoCard>

            <BentoCard className="bg-white md:col-span-1 lg:col-span-6">
              <SectionLabel title="Menu" />
              <MenuPreview
                menuItems={menuItems}
                expanded={menuExpanded}
                onToggle={() => setMenuExpanded((value) => !value)}
              />
            </BentoCard>

            <BentoCard className="bg-[#FAF8F5] md:col-span-1 lg:col-span-6">
              <SectionLabel title="Promos & Offers" />
              <VisitorSignal entries={sortedEntries} restaurantPromo={restaurant.promo} />
            </BentoCard>

            <BentoCard className="bg-white md:col-span-2 lg:col-span-12">
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <SectionLabel title="Visitor Logbook" />
              </div>
              <EntryPreviewList entries={sortedEntries} loading={loadingEntries} />
            </BentoCard>
          </div>
        </main>
      </div>

      {isEditingPlace && (
        <Modal onClose={() => setIsEditingPlace(false)} closeOnBackdrop={false} closeOnEscape={false}>
          <RestaurantForm restaurant={restaurant} onClose={() => setIsEditingPlace(false)} />
        </Modal>
      )}

      {isConfirmingDelete && (
        <Modal onClose={() => setIsConfirmingDelete(false)} placement="center" closeOnBackdrop={false}>
          <DeletePlaceSheet
            restaurant={restaurant}
            onCancel={() => setIsConfirmingDelete(false)}
            onDeleted={() => {
              setIsConfirmingDelete(false);
              navigate("/top-places", { replace: true });
            }}
          />
        </Modal>
      )}
    </>
  );
}
