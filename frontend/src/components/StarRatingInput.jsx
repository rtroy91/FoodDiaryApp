import { Star } from "lucide-react";

function StarButton({ star, value, onChange }) {
  const fillPercent = Math.max(0, Math.min(100, (value - (star - 1)) * 100));

  return (
    <span className="relative inline-flex h-8 w-8 items-center justify-center">
      <Star size={24} className="text-stone-300" fill="none" />
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-start overflow-hidden text-amber-500"
        style={{ width: `${fillPercent}%` }}
      >
        <Star size={24} fill="currentColor" stroke="currentColor" />
      </span>
      <button
        type="button"
        role="radio"
        aria-checked={value === star - 0.5}
        aria-label={`${star - 0.5} star rating`}
        className="absolute left-0 top-0 h-full w-1/2"
        onClick={() => onChange(star - 0.5)}
      />
      <button
        type="button"
        role="radio"
        aria-checked={value === star}
        aria-label={`${star} star rating`}
        className="absolute right-0 top-0 h-full w-1/2"
        onClick={() => onChange(star)}
      />
    </span>
  );
}

export function StarRatingInput({ value, onChange }) {
  return (
    <div
      className="star-rating flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <StarButton key={star} star={star} value={value} onChange={onChange} />
      ))}
      <span className="ml-2 text-sm font-semibold text-stone-600">
        {value ? value.toFixed(1) : "-"}
      </span>
    </div>
  );
}
