import headerShapes from "../assets/header-shapes.svg";

export function PageHeader({ title, subtitle, maxWidth = "1180px" }) {
  return (
    <div className="relative h-48 shrink-0 overflow-hidden bg-[#1C1107]">
      <img
        src={headerShapes}
        alt=""
        width="1440"
        height="192"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      <div
        className="relative z-10 mx-auto flex max-w-140 items-end justify-between px-5 pt-20 pb-7"
        style={{ boxSizing: "border-box", maxWidth, width: "100%" }}
      >
        <div>
          <p className="text-3xl font-light leading-tight text-white" style={{ fontFamily: '"Fraunces", serif' }}>
            {title}
          </p>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-white/55">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
