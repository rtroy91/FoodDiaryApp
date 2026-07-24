import { useEffect, useId, useMemo, useState } from "react";
import { Camera, ChevronDown, Clock, MapPin, Star, X } from "lucide-react";
import { useCreateEntry, useRestaurantOptions, useUpdateEntry } from "../hooks/useDiaryData";
import { uploadPhoto } from "../api/entries";

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

const CAPTION_MAX_LENGTH = 280;

function RatingStarButton({ star, rating, onChange }) {
  const fillPercent = Math.max(0, Math.min(100, (rating - (star - 1)) * 100));
  const gradientId = useId().replaceAll(":", "");
  const strokeColor = fillPercent > 0 ? "#E89951" : "#C8B89A";

  return (
    <span className="relative inline-flex h-7 w-7 items-center justify-center transition hover:scale-110">
      <Star size={22} className="shrink-0" fill={`url(#${gradientId})`} stroke={strokeColor}>
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

export function PublishDiaryForm({ restaurants = [], entry = null, onClose }) {
  const isEditing = Boolean(entry);
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();
  const { data: fetchedRestaurants = [] } = useRestaurantOptions({
    enabled: restaurants.length === 0,
  });

  const [currentVisitDate, setCurrentVisitDate] = useState(() => new Date());
  const [errorMessage, setErrorMessage] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(entry?.photoUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [form, setForm] = useState({
    restaurantId: entry?.restaurant?.id ?? "",
    rating: entry?.rating ?? 0,
    caption: entry?.caption ?? "",
  });

  const availableRestaurants = restaurants.length ? restaurants : fetchedRestaurants;
  const displayedVisitDate = isEditing ? new Date(entry.visitedAt) : currentVisitDate;

  const restaurantOptions = useMemo(() => {
    const options = availableRestaurants.map((restaurant) => ({
      value: restaurant.id,
      label: restaurant.name,
    }));

    if (entry?.restaurant?.id && !options.some((option) => option.value === entry.restaurant.id)) {
      options.unshift({
        value: entry.restaurant.id,
        label: entry.restaurant.name,
      });
    }

    return options;
  }, [availableRestaurants, entry]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrorMessage(null);
  }

  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (isEditing) return undefined;

    const intervalId = window.setInterval(() => {
      setCurrentVisitDate(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isEditing]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage(null);

    if ((!photoFile && !photoPreview) || !form.restaurantId || form.rating === 0) {
      setShowValidation(true);
      setErrorMessage(
        isEditing
          ? "Keep a photo, place, and rating before saving changes."
          : "Add a photo, choose a place, and rate the visit before publishing."
      );
      return;
    }

    try {
      setIsUploading(true);

      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile);
      }

      const savedPhotoUrl = photoFile ? photoUrl : photoPreview;

      if (isEditing) {
        await updateEntry.mutateAsync({
          id: entry.id,
          payload: {
            visitedAt: entry.visitedAt ?? new Date().toISOString(),
            restaurantId: form.restaurantId,
            rating: form.rating,
            caption: form.caption,
            photoUrl: savedPhotoUrl,
          },
        });
      } else {
        await createEntry.mutateAsync({
          restaurantId: form.restaurantId,
          visitedAt: new Date().toISOString(),
          rating: form.rating,
          caption: form.caption,
          photoUrl: savedPhotoUrl,
        });
      }

      onClose?.();
    } catch {
      setErrorMessage(
        isEditing
          ? "We couldn't save your changes. Please try again."
          : "We couldn't publish your post. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  }

  const isSaving = createEntry.isPending || updateEntry.isPending || isUploading;
  const showLocationNudge = showValidation && !form.restaurantId;
  const showRatingNudge = showValidation && form.rating === 0;
  const showPhotoNudge = showValidation && !photoFile && !photoPreview;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-[#FFFDF9] shadow-[0_20px_70px_rgba(28,17,7,0.18)]">
      <div className="flex items-center justify-between border-b border-[#EFE4D5] px-5 py-4">
        <h2 id="publish-diary-title" className="text-base font-extrabold tracking-tight text-[#1C1107]">
          {isEditing ? "Edit post" : "New post"}
        </h2>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#756450] transition hover:bg-[#F3EBDF] hover:text-[#1C1107]"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="px-5 py-4">
        <label className="group block cursor-pointer">
          <span className="sr-only">Add food photo</span>
          <div
            className={`relative mx-auto aspect-square max-h-72 max-w-72 overflow-hidden rounded-3xl border border-dashed bg-[#F7EFE5] transition ${
              showPhotoNudge ? "border-[#E04B39] bg-[#FFF2E8]" : "border-[#D8CDBB]"
            }`}
          >
            {photoPreview ? (
              <>
                <img
                  src={photoPreview}
                  alt="Selected food preview"
                  width="576"
                  height="576"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                  Change photo
                </span>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-[#756450] transition group-hover:text-[#E04B39]">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(28,17,7,0.10)]">
                  <Camera size={24} />
                </span>
                <span className="text-sm font-extrabold">+ Add food photo</span>
              </div>
            )}
            <input type="file" name="entryPhoto" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
        </label>

        <label className="mt-3 block border-b border-[#EFE4D5] pb-2">
          <span className="sr-only">Caption</span>
          <textarea
            name="caption"
            value={form.caption}
            onChange={(e) => handleChange("caption", e.target.value)}
            placeholder="Write a caption…"
            autoComplete="off"
            maxLength={CAPTION_MAX_LENGTH}
            rows={5}
            className="block w-full resize-none bg-transparent px-1 text-sm leading-6 text-[#1F1B16] outline-none placeholder:text-[#A79884]"
          />
          <span className="block text-right text-xs font-semibold text-[#A79884]">
            {form.caption.length}/{CAPTION_MAX_LENGTH}
          </span>
        </label>

        <div className="mt-3 divide-y divide-[#EFE4D5] rounded-[22px] border border-[#EFE4D5] bg-[#FFFAF2]">
          <label
            className={`flex items-center gap-3 px-4 py-2.5 transition ${showLocationNudge ? "bg-[#FFF2E8]" : ""}`}
          >
            <MapPin size={19} className="shrink-0 text-[#E04B39]" />
            <span className="sr-only">Place Name</span>
            <div className="relative min-w-0 flex-1">
              <select
                name="restaurantId"
                value={form.restaurantId}
                onChange={(e) => handleChange("restaurantId", e.target.value)}
                className="w-full appearance-none bg-transparent pr-7 text-sm font-semibold text-[#1F1B16] outline-none"
              >
                <option value="">Where did you eat?</option>
                {restaurantOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#8C7B6A]"
              />
            </div>
          </label>

          <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 transition ${
              showRatingNudge ? "bg-[#FFF2E8]" : ""
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <Star size={19} className="shrink-0 text-[#E89951]" />
              <span className="text-sm font-semibold text-[#1F1B16]">Rate your experience</span>
            </div>
            <div
              className="flex shrink-0 items-center gap-1"
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

          <div className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#1F1B16]">
            <Clock size={19} className="shrink-0 text-[#8C7B6A]" />
            <span className="min-w-0 flex-1 truncate">
              {formatVisitDate(displayedVisitDate)} at {formatVisitTime(displayedVisitDate)}
            </span>
          </div>
        </div>

        {errorMessage && (
          <p className="mt-3 text-sm font-semibold text-[#E04B39]" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(224,75,57,0.25)] transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (isEditing ? "Saving…" : "Publishing…") : isEditing ? "Save Changes" : "Publish to Diary"}
        </button>
      </form>
    </div>
  );
}
