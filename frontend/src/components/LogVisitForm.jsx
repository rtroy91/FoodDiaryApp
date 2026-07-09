import { useId, useState } from "react";
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

function RatingStarButton({ star, rating, onChange }) {
  const fillPercent = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
  const gradientId = useId().replaceAll(":", "");
  const strokeColor = fillPercent > 0 ? "#E89951" : "#C8B89A";

  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center transition hover:scale-110">
      <Star
        size={22}
        className="shrink-0"
        fill={`url(#${gradientId})`}
        stroke={strokeColor}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset={`${fillPercent}%`} stopColor="#E89951" />
            <stop offset={`${fillPercent}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
      </Star>
      <button
        type="button"
        role="radio"
        aria-checked={rating === star - 0.5}
        onClick={() => onChange(star - 0.5)}
        className="absolute left-0 top-0 h-full w-1/2"
        aria-label={`${star - 0.5} star rating`}
      />
      <button
        type="button"
        role="radio"
        aria-checked={rating === star}
        onClick={() => onChange(star)}
        className="absolute right-0 top-0 h-full w-1/2"
        aria-label={`${star} star rating`}
      />
    </span>
  );
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

    if (form.rating === 0) {
      setErrorMessage("Pick a rating from 1 to 5 stars.");
      return;
    }

    try {
      const restaurant = await createEntry.mutateAsync({
        restaurantId: form.restaurantId,
        visitedAt: new Date().toISOString(),
        rating: form.rating,
        caption: form.caption,
        photoUrl: null,
      });

      onClose?.();
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
            <span className="ml-0.5 text-[#E04B39]">*</span>
          </span>
          <div
            className="flex items-center gap-1 rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3"
            role="radiogroup"
            aria-label="Rating"
            aria-required="true"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <RatingStarButton
                key={star}
                star={star}
                rating={form.rating}
                onChange={(rating) => handleChange("rating", rating)}
              />
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

        {errorMessage && (
          <p className="text-sm font-medium text-[#E04B39]">{errorMessage}</p>
        )}

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
