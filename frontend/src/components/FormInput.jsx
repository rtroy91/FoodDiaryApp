export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  required,
  minLength,
  step,
  children,
}) {
  return (
    <label className="block">
      <span
        className="mb-2 block text-xs font-medium uppercase text-[#8C7B6A]"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        {label}
        {required && <span className="ml-0.5 text-[#E04B39]">*</span>}
      </span>

      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          minLength={minLength}
          step={step}
          className="w-full rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3 pr-12 text-sm text-[#1F1B16] outline-none transition focus:border-[#E04B39]/20 focus:ring-2 focus:ring-[#E04B39]/20 disabled:opacity-50"
        />
        {children && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {children}
          </div>
        )}
      </div>
    </label>
  );
}
