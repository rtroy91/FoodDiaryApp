import { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { FormInput } from "./FormInput";
import { SelectInput } from "./SelectInput";
import { useCreateEntry } from "../hooks/useDiaryData";

function formatVisitDate(date) {
  return date.toLocaleDateString("en-PH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatVisitTime(date) {
  return date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LogVisitForm({ restaurants = [], onClose }) {
  const createEntry = useCreateEntry();

  const now = new Date();
  const [errorMessage, setErrorMessage] = useState(null);
  const [form, setForm] = useState({
    restaurantId: "",
    rating: 0,
    caption: "",
  });

  const restaurantOptions = restaurants.map((restaurant) => ({
    value: restaurant.id,
    label: restaurant.name,
  }));

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const restaurant = await createEntry.mutateAsync({
        restaurantId: form.restaurantId,
        visitedAt: new Date().toISOString(),
        rating: form.rating,
        caption: form.caption,
        photoUrl: null,
      });

      onClose?.();
      navigate(`/place-details/${restaurant.id}`);
    } catch {
      setErrorMessage("Could not save the log. Try again.");
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-white shadow-[0_8px_40px_rgba(28,17,7,0.12)]">
      <div className="flex items-center justify-between border-b border-[#F0EAE0] px-6 py-5">
        <h2
          className="text-xl font-semibold text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          Log a visit
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

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
        <SelectInput
          label="Place Name"
          value={form.restaurantId}
          onChange={(value) => handleChange("restaurantId", value)}
          required
          placeholder="Select place"
          options={restaurantOptions}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Date"
            value={formatVisitDate(now)}
            onChange={() => {}}
            disabled
          />
          <FormInput
            label="Time"
            value={formatVisitTime(now)}
            onChange={() => {}}
            disabled
          />
        </div>

        <div>
          <span
            className="mb-2 block text-xs font-medium uppercase text-[#8C7B6A]"
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            Rating
          </span>
          <div className="flex gap-1 rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleChange("rating", star)}
                className="text-[#C8B89A] transition hover:scale-110"
                aria-label={`${star} star rating`}
              >
                <Star
                  size={22}
                  fill={star <= form.rating ? "#E89951" : "none"}
                  stroke={star <= form.rating ? "#E89951" : "#C8B89A"}
                />
              </button>
            ))}
          </div>
        </div>

        <FormInput
          label="Caption"
          value={form.caption}
          onChange={(value) => handleChange("caption", value)}
          placeholder="How was it?"
        />

        <label className="block">
          <span
            className="mb-2 block text-xs font-medium uppercase text-[#8C7B6A]"
            style={{ fontFamily: '"Geist Mono", monospace' }}
          >
            Upload Photo
          </span>
          <div className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#D8CDBB] bg-[#F5EEE4] px-4 py-4 text-sm text-stone-500 transition hover:border-[#E04B39]/30">
            <Upload size={18} />
            <span>Choose a photo</span>
            <input type="file" accept="image/*" className="hidden" />
          </div>
        </label>

        <button
          type="submit"
          disabled={createEntry.isPending}
          className="w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f]"
        >
          {createEntry.isPending ? "Saving..." : "Log Visit"}
        </button>
      </form>
    </div>
  );
}
