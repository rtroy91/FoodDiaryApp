import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useCreateRestaurant } from "../hooks/useDiaryData";
import { useBataanCities, useBarangaysByCity } from "../hooks/usePsgc";
import { BATAAN_PROVINCE_NAME } from "../api/psgc";
import { FormInput, SelectInput } from "../components";

export function AddRestaurantForm({ onClose }) {
  const navigate = useNavigate();
  const createRestaurant = useCreateRestaurant();

  const {
    data: cities = [],
    isLoading: loadingCities,
    isError: citiesError,
  } = useBataanCities();

  const [form, setForm] = useState({
    name: "",
    address: "",
    cityCode: "",
    cityName: "",
    barangay: "",
    category: "",
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const { data: barangays = [], isLoading: loadingBarangays } =
    useBarangaysByCity(form.cityCode);

  const cityOptions = [...cities]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((city) => ({
      value: city.code,
      label: city.name,
    }));

  const barangayOptions = [...barangays]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brgy) => ({
      value: brgy.name,
      label: brgy.name,
    }));

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCityChange(code) {
    const city = cities.find((item) => item.code === code);

    setForm((prev) => ({
      ...prev,
      cityCode: code,
      cityName: city?.name ?? "",
      barangay: "",
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const restaurant = await createRestaurant.mutateAsync({
        name: form.name,
        address: form.address,
        barangay: form.barangay,
        city: form.cityName,
        province: BATAAN_PROVINCE_NAME,
        category: form.category,
      });

      onClose?.();
      navigate(`/restaurants/${restaurant.id}`);
    } catch {
      setErrorMessage("Could not save this place. Try again.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_8px_40px_rgba(28,17,7,0.12)]">
      <div className="flex items-center justify-between border-b border-[#F0EAE0] px-6 py-5">
        <h2
          className="text-xl font-semibold text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          Add a new place
        </h2>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-[#F5F0E8] hover:text-[#1C1107]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
        <FormInput
          label="Place Name"
          value={form.name}
          onChange={(value) => handleChange("name", value)}
          placeholder="e.g. Jollibee Balanga"
          required
        />

        <FormInput
          label="Address"
          value={form.address}
          onChange={(value) => handleChange("address", value)}
          placeholder="Street, building, landmark"
        />

        <FormInput
          label="Category"
          value={form.category}
          onChange={(value) => handleChange("category", value)}
          placeholder="e.g. Fast food"
        />

        <FormInput
          label="Province"
          value={BATAAN_PROVINCE_NAME}
          onChange={() => {}}
          disabled
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <SelectInput
              label="City / Municipality"
              value={form.cityCode}
              onChange={handleCityChange}
              required
              disabled={loadingCities || citiesError}
              placeholder={loadingCities ? "Loading..." : "Select city"}
              options={cityOptions}
            />
            {citiesError && (
              <p className="mt-1 text-[10px] text-[#E04B39]">
                Couldn't load cities.
              </p>
            )}
          </div>

          <SelectInput
            label="Barangay"
            value={form.barangay}
            onChange={(value) => handleChange("barangay", value)}
            required
            disabled={!form.cityCode || loadingBarangays}
            placeholder={loadingBarangays ? "Loading..." : "Select barangay"}
            options={barangayOptions}
          />
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-[#E04B39]/20 bg-[#E04B39]/10 px-4 py-3 text-xs text-[#C44A3C]">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={
            createRestaurant.isPending || loadingCities || loadingBarangays
          }
          className="w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {createRestaurant.isPending ? "Saving..." : "Add Place"}
        </button>
      </form>
    </div>
  );
}
