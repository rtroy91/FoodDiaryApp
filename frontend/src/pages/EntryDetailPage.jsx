import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Clock3,
  Image as ImageIcon,
  MapPin,
  Star,
  Store,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { useEntries, useEntry, useRestaurant } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";

const pageShellStyle = {
  boxSizing: "border-box",
  maxWidth: "1180px",
  width: "100%",
};

function formatDate(value, variant = "long") {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";

  return date.toLocaleDateString("en-PH", {
    month: variant === "short" ? "short" : "long",
    day: "2-digit",
    year: "numeric",
  });
}

function getYear(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : String(date.getFullYear());
}

function getLocation(restaurant) {
  return [restaurant?.barangay ? `Brgy. ${restaurant.barangay}` : null, restaurant?.city, restaurant?.province]
    .filter(Boolean)
    .join(", ");
}

function getEntryRestaurantId(entry) {
  return entry?.restaurant?.id ?? null;
}

function getEntryRestaurantName(entry) {
  return entry?.restaurant?.name ?? null;
}

function matchesRestaurant(entry, restaurant, selectedEntry, restaurantId) {
  const targetId = restaurant?.id ?? restaurantId ?? getEntryRestaurantId(selectedEntry);
  if (targetId && String(getEntryRestaurantId(entry)) === String(targetId)) return true;

  const targetName = restaurant?.name ?? getEntryRestaurantName(selectedEntry);
  return Boolean(targetName && getEntryRestaurantName(entry) === targetName);
}

function averageRating(entries = [], fallback) {
  const ratings = entries.map((entry) => entry.rating).filter((rating) => typeof rating === "number");
  if (!ratings.length) return fallback ?? null;

  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
}

function buildGalleryEntries(entries = [], selectedEntry) {
  const selectedPhoto =
    selectedEntry?.photoUrl && !entries.some((entry) => entry.id === selectedEntry.id) ? [selectedEntry] : [];

  return [...selectedPhoto, ...entries.filter((entry) => entry.photoUrl)].slice(0, 6);
}

function getMenuPreview(restaurant) {
  if (restaurant?.menuPhotoUrl) {
    return {
      name: "Menu photo",
      imageUrl: restaurant.menuPhotoUrl,
    };
  }

  return {
    name: `${categoryLabel(restaurant?.category, "Food place")} menu`,
    imageUrl: null,
  };
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="mb-4">
      {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8C7B6A]">{eyebrow}</p>}
      <h2
        className="mt-1 text-2xl font-normal leading-tight text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {title}
      </h2>
    </div>
  );
}

function HubPanel({ children, className = "" }) {
  return <section className={`rounded-[28px] border border-[#E8DFC8] bg-white p-5 ${className}`}>{children}</section>;
}

function DetailTile({ icon: Icon, label, value, className = "" }) {
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

function formatStandardTime(value) {
  if (!value || typeof value !== "string") return value;

  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return value;

  const hour = Number(match[1]);
  const minute = match[2];
  if (Number.isNaN(hour) || hour > 23) return value;

  const period = hour >= 12 ? "PM" : "AM";
  const standardHour = hour % 12 || 12;

  return `${standardHour}:${minute} ${period}`;
}

function formatOpeningHours(value) {
  if (!Array.isArray(value)) return value;
  if (!value.length) return "N/A";

  return [...value]
    .sort((a, b) => a.day - b.day)
    .map((item) => ({
      day: OPENING_DAY_LABELS[item.day] ?? `Day ${item.day}`,
      hours:
        item.open && item.close ? `${formatStandardTime(item.open)} - ${formatStandardTime(item.close)}` : "Closed",
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
    <div className="grid gap-2 sm:grid-cols-[45fr_55fr]">
      <AddressTile value={fullAddress || "N/A"} restaurantId={restaurant.id} className="sm:col-span-2" />
      <DetailTile icon={UtensilsCrossed} label="Category" value={category} />
      <DetailTile
        icon={Clock3}
        label="Opening hours"
        value={<OpeningHoursValue value={openingHours} />}
        className="sm:row-span-2"
      />
      <DetailTile
        icon={Wallet}
        label="Budget"
        value={<BudgetValue value={restaurant.priceRange || restaurant.budget} />}
      />
    </div>
  );
}

function HeaderStatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/6 p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#F0E76F]">
        <Icon size={16} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-1 text-2xl font-normal leading-tight text-white" style={{ fontFamily: '"Fraunces", serif' }}>
        {value}
      </p>
    </div>
  );
}

function VisitTimeline({ entries = [], selectedEntry }) {
  if (!entries.length) {
    return (
      <div className="rounded-3xl bg-[#F5EEE4] px-5 py-10 text-center">
        <Clock3 size={32} className="mx-auto mb-3 text-[#C8B89A]" />
        <p className="text-sm text-stone-500">A clean slate. Time to make some questionable choices.</p>
      </div>
    );
  }

  const groupedEntries = entries.reduce((groups, entry) => {
    const year = getYear(entry.visitedAt);
    return {
      ...groups,
      [year]: [...(groups[year] ?? []), entry],
    };
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(groupedEntries)
        .sort(([a], [b]) => Number(b) - Number(a))
        .slice(0, 3)
        .map(([year, yearEntries]) => (
          <div key={year}>
            <p className="mb-2 text-xs font-extrabold text-[#8C7B6A]">({year})</p>
            <div className="relative grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="absolute left-3 right-3 top-4 hidden h-px bg-[#D8CDBB] sm:block" aria-hidden="true" />
              {yearEntries.slice(0, 4).map((entry) => {
                const isSelected = selectedEntry?.id === entry.id;

                return (
                  <Link
                    key={entry.id}
                    to={`/entries/${entry.id}`}
                    className={`relative z-10 rounded-2xl border px-3 py-2 text-left no-underline transition ${
                      isSelected
                        ? "border-[#E04B39]/40 bg-[#FFF3E8] text-[#1C1107] ring-2 ring-[#E04B39]/10"
                        : "border-[#E8DFC8] bg-white text-[#5A4A34] hover:bg-[#F7EFE5]"
                    }`}
                  >
                    <span
                      className={`mb-2 block h-3 w-3 rounded-full ${isSelected ? "bg-[#E04B39]" : "bg-[#C8B89A]"}`}
                    />
                    <span className="block text-[11px] font-bold uppercase tracking-[0.08em]">
                      {formatDate(entry.visitedAt, "short")}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#B8960A]">
                      <Star size={12} fill="currentColor" />
                      {entry.rating ?? "-"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}

function PhotoGallery({ photos = [] }) {
  if (!photos.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl bg-[#F5EEE4] text-center">
        <Camera size={34} className="mb-3 text-[#C8B89A]" />
        <p className="text-sm text-stone-500">Camera-shy, or just forgot to snap a pic?</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {photos.slice(0, 5).map((photo, index) => (
        <div
          key={photo.id}
          className={`group relative overflow-hidden rounded-3xl bg-[#E8DFC8] ${
            index === 0 ? "col-span-2 h-72 md:row-span-2 md:h-full" : "h-34 md:h-40"
          }`}
        >
          <img
            src={photo.photoUrl}
            alt={photo.caption || "Food diary photo"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          {photo.caption && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-16 items-end bg-linear-to-t from-black/65 to-transparent p-3">
              <p className="line-clamp-2 text-xs font-semibold leading-5 text-white">{photo.caption}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CompactMenuPanel({ menuPreview }) {
  return (
    <div className="group relative h-28 overflow-hidden rounded-2xl bg-[#E8DFC8]">
      {menuPreview?.imageUrl ? (
        <img
          src={menuPreview.imageUrl}
          alt={menuPreview.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#9B8B72]">
          <ImageIcon size={24} />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-[#1C1107]/0 transition duration-300 group-hover:bg-[#1C1107]/65">
        <span className="translate-y-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1C1107] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Menu
        </span>
      </div>
    </div>
  );
}

function CompactPromoPanel({ entries = [], restaurantPromo }) {
  const promo =
    restaurantPromo ||
    entries
      .map((entry) => entry.caption || "")
      .find((caption) => /promo|discount|sale|deal|free|voucher/i.test(caption));

  return (
    <div className="grid gap-3">
      <div className="rounded-[22px] bg-[#FFF7D2] p-4">
        <p className="mt-2 text-xs leading-5 text-stone-600">
          {promo || "Nothing is free today. Your bank account sends its regards."}
        </p>
      </div>
    </div>
  );
}

export function EntryDetailPage() {
  const { id, restaurantId } = useParams();
  const isPlacePreview = Boolean(restaurantId);
  const { data: place, isLoading: isLoadingPlace } = useRestaurant(restaurantId);
  const { data: entry = null, isLoading: isLoadingEntry } = useEntry(isPlacePreview ? null : id);

  const restaurant = isPlacePreview ? place : entry?.restaurant;
  const relatedRestaurantId = restaurantId ?? getEntryRestaurantId(entry);
  const { data: entries = [], isLoading: isLoadingEntries } = useEntries(relatedRestaurantId);

  const relatedEntries = useMemo(
    () =>
      [...entries]
        .filter((item) => matchesRestaurant(item, restaurant, entry, restaurantId))
        .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()),
    [entries, entry, restaurant, restaurantId]
  );

  const selectedEntry = entry ?? relatedEntries[0] ?? null;
  const location = getLocation(restaurant);
  const fullAddress = [restaurant?.address, location].filter(Boolean).join(", ");
  const category = categoryLabel(restaurant?.category, "Food place");
  const avgRating = averageRating(relatedEntries, restaurant?.averageRating);
  const firstVisit = relatedEntries.length ? relatedEntries[relatedEntries.length - 1] : null;
  const photos = buildGalleryEntries(relatedEntries, selectedEntry);
  const menuPreview = getMenuPreview(restaurant);
  const isLoading = isLoadingEntries || (!isPlacePreview && isLoadingEntry) || (isPlacePreview && isLoadingPlace);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-4 py-16 text-center text-sm text-stone-500">
        Loading diary profile...
      </div>
    );
  }

  if (!selectedEntry && !restaurant) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] px-4 py-16 text-center">
        <p className="mb-3 text-2xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
          {isPlacePreview ? "Food place not found" : "Diary entry not found"}
        </p>
        <Link to="/entries" className="text-sm font-semibold text-[#E89951] no-underline">
          Back to entries
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#FDFBF7] text-[#1C1107] antialiased">
      <header className="relative shrink-0 overflow-hidden border-b border-[#E8DFC8] bg-[#1C1107] text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute left-10 top-10 h-24 w-24 rounded-full border border-[#F0E76F]/15" />
          <div className="absolute right-16 top-8 h-28 w-28 rotate-12 rounded-[28px] border border-[#E89951]/15" />
          <div className="absolute bottom-0 left-1/3 h-24 w-56 rounded-t-full border border-[#A5CF83]/10" />
        </div>

        <div className="relative z-10 mx-auto px-5 py-10 lg:px-6 lg:py-14" style={pageShellStyle}>
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link
              to="/entries"
              className="group inline-flex max-w-full items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 no-underline transition hover:bg-white/15"
            >
              <ArrowLeft className="shrink-0 transition-transform group-hover:-translate-x-0.5" size={14} />
              Back to Entries
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-end">
            <div className="flex min-w-0 items-start gap-4">
              <span className="mt-2 flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-white/8 text-[#F0E76F]">
                {restaurant?.storePhotoUrl ? (
                  <img
                    src={restaurant.storePhotoUrl}
                    alt={`${restaurant.name} store icon`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={28} />
                )}
              </span>
              <div className="min-w-0">
                <h1
                  className="mt-3 min-w-0 max-w-4xl text-5xl font-normal leading-none text-white sm:text-6xl lg:text-7xl"
                  style={{ fontFamily: '"Fraunces", serif' }}
                >
                  {restaurant?.name ?? "Food memory"}
                </h1>
                {(location || restaurant?.city) && (
                  <p className="mt-3 flex items-center gap-2 text-sm font-semibold leading-5 text-white/65 sm:text-base">
                    <MapPin size={16} className="shrink-0 text-[#F0E76F]" />
                    <span>{location || restaurant.city}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-3 lg:justify-self-end">
              <HeaderStatCard icon={CalendarDays} label="Obsession Level" value={relatedEntries.length} />
              <HeaderStatCard
                icon={Star}
                label="Overall Verdict"
                value={avgRating != null ? avgRating.toFixed(1) : "-"}
              />
              <HeaderStatCard
                icon={Clock3}
                label="Origin Story"
                value={firstVisit ? formatDate(firstVisit.visitedAt, "short") : "N/A"}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full flex-1 flex-col px-5 py-6 lg:px-6 lg:py-8" style={pageShellStyle}>
        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-10 pr-1">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-[40fr_35fr_15fr]">
            <HubPanel>
              <SectionLabel title="Directory Information" />
              <PlaceProfile restaurant={restaurant} category={category} fullAddress={fullAddress} />
            </HubPanel>

            <HubPanel>
              <SectionLabel title="Visual Evidence" />
              <PhotoGallery photos={photos} />
            </HubPanel>

            <div className="grid gap-2">
              <HubPanel>
                <SectionLabel title="Menu" />
                <CompactMenuPanel menuPreview={menuPreview} />
              </HubPanel>

              <HubPanel>
                <SectionLabel title="Promos" />
                <CompactPromoPanel entries={relatedEntries} restaurantPromo={restaurant?.promo} />
              </HubPanel>
            </div>

            <HubPanel className="lg:col-span-3">
              <SectionLabel title="Memory Lane" />
              <VisitTimeline entries={relatedEntries} selectedEntry={selectedEntry} />
            </HubPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
