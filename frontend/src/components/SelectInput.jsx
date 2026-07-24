export function SelectInput({
  label,
  value,
  onChange,
  required,
  disabled,
  ariaLabel,
  name,
  id,
  autoComplete = "off",
  placeholder = "Select an option",
  showPlaceholder = true,
  options = [],
  children,
}) {
  return (
    <label htmlFor={id} className="block">
      {label && (
        <span className="mb-2 block text-xs font-medium uppercase text-[#8C7B6A]">
          {label}
          {required && <span className="ml-0.5 text-[#E04B39]">*</span>}
        </span>
      )}

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          aria-label={ariaLabel}
          autoComplete={autoComplete}
          className="select-scrollbar w-full appearance-none rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3 pr-12 text-sm text-[#1F1B16] outline-none transition focus:border-[#E04B39]/20 focus:ring-2 focus:ring-[#E04B39]/20 disabled:cursor-not-allowed disabled:text-stone-600"
        >
          {showPlaceholder && <option value="">{placeholder}</option>}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}

          {children}
        </select>

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xl text-[#8C7B6A]">▾</span>
      </div>
    </label>
  );
}
