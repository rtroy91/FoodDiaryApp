import { formatDiaryDate, getGreeting } from "../utils/diaryStats";

export function DiaryHeader({ userName, subtitle = "Here's your food history at a glance." }) {
  const today = new Date();

  return (
    <div className="relative h-48 shrink-0 overflow-hidden bg-[#1C1107]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 560 164"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <circle cx="480" cy="30" r="60" fill="#A5CF83" opacity="0.08" />
        <circle cx="500" cy="90" r="30" fill="#F0E76F" opacity="0.08" />
        <rect x="20" y="100" width="40" height="40" fill="#ECB65F" opacity="0.08" transform="rotate(15 40 120)" />
        <circle cx="60" cy="40" r="18" fill="#E89951" opacity="0.08" />
        <rect x="380" y="120" width="20" height="20" fill="#A5CF83" opacity="0.08" transform="rotate(30 390 130)" />
        <circle cx="200" cy="140" r="10" fill="#F0E76F" opacity="0.08" />
      </svg>

      <div className="relative z-10 mx-auto flex max-w-140 items-end justify-between px-5 pb-7 pt-20">
        <div>
          <p className="text-3xl font-light leading-tight text-white" style={{ fontFamily: '"Fraunces", serif' }}>
            {getGreeting()}, <span className="italic text-[#F0E76F]">{userName}</span>
          </p>
          <p className="mt-1 text-sm text-white/75">{subtitle}</p>
        </div>

        <div className="text-right">
          <p className="text-[36px] font-light leading-none text-white/12" style={{ fontFamily: '"Fraunces", serif' }}>
            {String(today.getDate()).padStart(2, "0")}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/60">{formatDiaryDate(today)}</p>
        </div>
      </div>
    </div>
  );
}
