export function StatCard({ value, label, icon: Icon, iconColor, iconBgColor }) {
  return (
    <div className="border rounded-2xl border-[#E8DFC8] bg-stone-50 px-5 py-4">
      {Icon && (
        <div
          className="mb-2 w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={16} color={iconColor} />
        </div>
      )}
      <p
        className="text-2xl font-semibold leading-none text-[#1C1107]"
        style={{ fontFamily: '"Fraunces", serif' }}
      >
        {value}
      </p>
      <p
        className="mt-1 text-xs font-medium uppercase tracking-wider text-stone-500"
        style={{ fontFamily: '"Geist Mono", monospace' }}
      >
        {label}
      </p>
    </div>
  );
}
