export function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  required,
  minLength,
  maxLength,
  step,
  name,
  autoComplete,
  spellCheck,
  readOnly,
  id,
  inputClassName = "",
  children,
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-[#5F4A37]">
        {label}
        {required && <span className="ml-0.5 text-[#B83224]">*</span>}
      </span>

      <div className="relative">
        <input
          name={name}
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          step={step}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          readOnly={readOnly}
          className={`min-h-12 w-full rounded-2xl border border-[#D8CDBB] bg-[#F5EEE4] px-4 py-3 pr-16 text-sm text-[#1F1B16] outline-none transition focus:border-[#B83224]/30 focus:ring-2 focus:ring-[#B83224]/20 disabled:opacity-50 ${inputClassName}`}
        />
        {children && <div className="absolute inset-y-0 right-0.5 flex items-center">{children}</div>}
      </div>
    </label>
  );
}
