import { Clock, MapPin, Star } from "lucide-react";
import { DiaryHeader } from "./DiaryHeader";
import { StatCard, StatCardSkeleton } from "./StatCard";

export function DiaryPageLayout({ userName, className = "h-full", children }) {
  return (
    <div className={`relative overflow-hidden bg-[#F5F0E8] ${className}`}>
      <DiaryHeader userName={userName} />
      {children}
    </div>
  );
}

export function DiaryStatsGrid({ stats, loading, className = "mb-4" }) {
  return (
    <div className={`relative z-20 -mt-7 grid grid-cols-3 gap-2.5 ${className}`}>
      {loading ? (
        <>
          <StatCardSkeleton icon={MapPin} iconColor="#e63922" iconBgColor="#fde8e5" />
          <StatCardSkeleton icon={Clock} iconColor="#2b5fc4" iconBgColor="#e3eaf8" />
          <StatCardSkeleton icon={Star} iconColor="#B8960A" iconBgColor="#FEF6C7" />
        </>
      ) : (
        <>
          <StatCard
            value={stats.totalPlaces}
            label="Places Visited"
            icon={MapPin}
            iconColor="#e63922"
            iconBgColor="#fde8e5"
          />
          <StatCard
            value={stats.totalEntries}
            label="Total Entries"
            icon={Clock}
            iconColor="#2b5fc4"
            iconBgColor="#e3eaf8"
          />
          <StatCard
            value={stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "-"}
            label="Avg Rating"
            icon={Star}
            iconColor="#B8960A"
            iconBgColor="#FEF6C7"
          />
        </>
      )}
    </div>
  );
}
