import { useMemo, useState } from "react";
import { useBataanCities, useBarangaysByCity } from "./usePsgc";
import { cleanLocationText } from "../utils/location";

function getCityName(city) {
  return cleanLocationText(city.name ?? city.cityMunicipalityName ?? city.fullName ?? city.code);
}

function getCityCode(city) {
  return cleanLocationText(city.code);
}

function getBarangayName(barangay) {
  return cleanLocationText(barangay.name);
}

export function useFoodPlaceFilters(places = [], { onFilterChange } = {}) {
  const { data: bataanCities = [], isLoading: loadingCities, isError: isCitiesError } = useBataanCities();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [cityCode, setCityCode] = useState("");
  const [city, setCity] = useState("all");
  const [barangay, setBarangay] = useState("all");

  const { data: psgcBarangays = [], isLoading: loadingBarangays } = useBarangaysByCity(cityCode);

  const cityOptions = useMemo(() => {
    return bataanCities
      .map((item) => {
        const code = getCityCode(item);
        const name = getCityName(item);
        return { value: code, label: name, name };
      })
      .filter((item) => item.value && item.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [bataanCities]);

  const barangayOptions = useMemo(() => {
    return psgcBarangays
      .map((item) => getBarangayName(item))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [psgcBarangays]);

  const filteredPlaces = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return places.filter((place) => {
      const matchesSearch = (place.name || "").toLowerCase().includes(normalizedSearchTerm);
      const matchesCategory = category === "all" || place.category === category;
      const matchesCity = city === "all" || cleanLocationText(place.city) === city;
      const matchesBarangay = barangay === "all" || cleanLocationText(place.barangay) === barangay;

      return matchesSearch && matchesCategory && matchesCity && matchesBarangay;
    });
  }, [barangay, category, city, places, searchTerm]);

  const hasActiveFilters = searchTerm.trim() !== "" || category !== "all" || cityCode !== "" || barangay !== "all";

  function notifyFilterChange() {
    onFilterChange?.();
  }

  function handleSearchChange(nextSearchTerm) {
    setSearchTerm(nextSearchTerm);
    notifyFilterChange();
  }

  function clearSearch() {
    setSearchTerm("");
    notifyFilterChange();
  }

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    notifyFilterChange();
  }

  function handleCityChange(nextCityCode) {
    const selectedCity = cityOptions.find((item) => item.value === nextCityCode);
    setCityCode(nextCityCode);
    setCity(selectedCity?.label ?? "all");
    setBarangay("all");
    notifyFilterChange();
  }

  function handleBarangayChange(nextBarangay) {
    setBarangay(nextBarangay);
    notifyFilterChange();
  }

  return {
    searchTerm,
    category,
    cityCode,
    barangay,
    cityOptions,
    barangayOptions,
    loadingCities,
    isCitiesError,
    loadingBarangays,
    hasActiveFilters,
    filteredPlaces,
    handleSearchChange,
    clearSearch,
    handleCategoryChange,
    handleCityChange,
    handleBarangayChange,
  };
}
