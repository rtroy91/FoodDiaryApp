import headerShapes from "../assets/header-shapes.svg";
import { formatDiaryDate, getGreeting } from "../utils/diaryStats";

export function DiaryHeader({ userName, subtitle = "Here's your food history at a glance." }) {
  const today = new Date();

  return (
    <div className="relative h-48 shrink-0 overflow-hidden bg-[#1C1107]">
      <img src={headerShapes} alt="" className="absolute inset-0 h-full w-full object-cover" aria-hidden="true" />

      <div className="relative z-10 mx-auto flex max-w-140 items-end justify-between gap-4 px-5 pb-7 pt-20">
        <div className="min-w-0 flex-1">
          <p
            className="flex min-w-0 items-baseline gap-x-2 text-3xl font-light leading-tight text-white"
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            <span className="shrink-0">{getGreeting()},</span>
            <span className="min-w-0 flex-1 truncate italic text-[#F0E76F]" title={userName}>
              {userName}
            </span>
          </p>
          <p className="mt-1 text-sm text-white/75">{subtitle}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[36px] font-light leading-none text-white/12" style={{ fontFamily: '"Fraunces", serif' }}>
            {String(today.getDate()).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{formatDiaryDate(today)}</p>
        </div>
      </div>
    </div>
  );
}
