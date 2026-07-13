import Skeleton from "react-loading-skeleton";

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
      <p className="text-2xl font-semibold leading-none text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
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

export function StatCardSkeleton({ icon: Icon, iconColor, iconBgColor }) {
  return (
    <div className="border rounded-2xl border-[#E8DFC8] bg-stone-50 px-5 py-4">
      {Icon && (
        <div
          className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={16} color={iconColor} />
        </div>
      )}
      <Skeleton width={24} height={32} borderRadius={6} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
      <Skeleton
        className="mt-2 block"
        width={80}
        height={12}
        borderRadius={6}
        baseColor="#f0ebe2"
        highlightColor="#fbf8f2"
      />
    </div>
  );
}
