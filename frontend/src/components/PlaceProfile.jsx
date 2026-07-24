import { Clock3, MapPin, UtensilsCrossed, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

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

  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function formatOpeningHours(value) {
  if (!Array.isArray(value)) return value;
  if (!value.length) return "N/A";

  return value
    .toSorted((a, b) => a.day - b.day)
    .map((item) => ({
      day: OPENING_DAY_LABELS[item.day] ?? `Day ${item.day}`,
      hours:
        item.open && item.close ? `${formatStandardTime(item.open)} – ${formatStandardTime(item.close)}` : "Closed",
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

function DetailTile({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-start gap-3 rounded-2xl bg-[#F5EEE4] px-3 py-2.5 ${className}`}>
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#6F5130]">
        <Icon size={15} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-stone-500">{label}</p>
        <div className="mt-0.5 break-words text-sm font-bold leading-5 text-[#1C1107]">{value || "Not added"}</div>
      </div>
    </div>
  );
}

function AddressTile({ value, restaurantId }) {
  return (
    <Link
      to={`/food-map?placeId=${restaurantId}`}
      className="group relative flex items-start gap-3 rounded-2xl bg-[#F5EEE4] px-3 py-2.5 text-[#1C1107] no-underline transition-colors hover:bg-[#EFE5D8] sm:col-span-2"
      aria-label="View address on map"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/75 text-[#6F5130]">
        <MapPin size={15} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-stone-500">Address</p>
        <div className="mt-0.5 break-words text-sm font-bold leading-5 text-[#1C1107]">{value || "Not added"}</div>
      </div>
    </Link>
  );
}

export function PlaceProfile({ restaurant, category, fullAddress, balancedColumns = false }) {
  const openingHours =
    formatOpeningHours(restaurant.openingHours) ?? restaurant.hours ?? restaurant.businessHours ?? "N/A";

  return (
    <div className={`grid gap-2 ${balancedColumns ? "sm:grid-cols-[45fr_55fr]" : "sm:grid-cols-2"}`}>
      <AddressTile value={fullAddress || "N/A"} restaurantId={restaurant.id} />
      <DetailTile icon={UtensilsCrossed} label="Category" value={category} />
      <DetailTile
        icon={Clock3}
        label="Opening Hours"
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
