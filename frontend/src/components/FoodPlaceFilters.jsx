import { Search, X } from "lucide-react";
import { FOODPLACE_CATEGORIES } from "../constants/foodPlaceCategories";
import { SelectInput } from "./SelectInput";

export function FoodPlaceFilters({
  searchTerm,
  onSearchChange,
  onClearSearch,
  searchInputName = "foodPlaceSearch",
  searchAriaLabel = "Search food place",
  searchPlaceholder = "Search food place",
  category,
  onCategoryChange,
  cityCode,
  onCityChange,
  cityOptions = [],
  loadingCities = false,
  cityError = false,
  barangay,
  onBarangayChange,
  barangayOptions = [],
  loadingBarangays = false,
  className = "-mt-8 mb-8",
}) {
  function handleClearSearch() {
    if (onClearSearch) {
      onClearSearch();
      return;
    }

    onSearchChange("");
  }

  return (
    <div
      className={[
        "relative z-20 grid shrink-0 grid-cols-1 gap-3 rounded-3xl border border-[#E8DFC8] bg-stone-50 p-3 shadow-[0_10px_28px_rgba(28,17,7,0.08)] sm:grid-cols-3 lg:grid-cols-[minmax(0,1fr)_220px_180px_200px]",
        className,
      ].join(" ")}
    >
      <label className="flex h-11.5 items-center gap-3 rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 text-sm text-[#5A4A34] transition-colors focus-within:border-[#E04B39]/20 focus-within:ring-2 focus-within:ring-[#E04B39]/20 sm:col-span-3 lg:col-span-1">
        <Search size={16} className="shrink-0 text-stone-600" />
        <input
          aria-label={searchAriaLabel}
          name={searchInputName}
          autoComplete="off"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#1C1107] outline-none placeholder:text-stone-600"
        />
        <button
          type="button"
          onClick={handleClearSearch}
          disabled={!searchTerm}
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/20",
            searchTerm ? "hover:bg-white/70 hover:text-[#1C1107]" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      </label>

      <SelectInput
        ariaLabel="Filter by category"
        value={category}
        onChange={onCategoryChange}
        showPlaceholder={false}
        options={[
          { value: "all", label: "All Categories" },
          ...FOODPLACE_CATEGORIES.map((item) => ({
            value: item.value,
            label: item.label,
          })),
        ]}
      />

      <SelectInput
        ariaLabel="Filter by city"
        value={cityCode}
        onChange={onCityChange}
        disabled={loadingCities || cityError || cityOptions.length === 0}
        showPlaceholder={false}
        options={[{ value: "", label: loadingCities ? "Loading cities..." : "Select City" }, ...cityOptions]}
      />

      <SelectInput
        ariaLabel="Filter by barangay"
        value={barangay}
        onChange={onBarangayChange}
        disabled={!cityCode || loadingBarangays}
        showPlaceholder={false}
        options={[
          { value: "all", label: loadingBarangays ? "Loading barangays..." : "Select Barangay" },
          ...barangayOptions.map((item) => ({
            value: item,
            label: item,
          })),
        ]}
      />
    </div>
  );
}
