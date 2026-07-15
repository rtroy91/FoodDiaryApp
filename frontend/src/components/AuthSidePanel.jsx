import { Check } from "lucide-react";
import foodHero from "../assets/food-register.svg";

function ShapeIllustration() {
  return (
    <>
      <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#F0D96B]/40" />
      <div className="absolute bottom-10 right-10 h-32 w-32 rotate-12 bg-[#E04B39]/20" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
      <div className="absolute right-10 top-28 h-16 w-16 rounded-full bg-white/20" />
      <div className="absolute left-10 bottom-24 h-20 w-20 rotate-45 rounded-2xl bg-[#F5E642]/20" />
      <div className="absolute left-1/3 top-10 h-28 w-28 rounded-4xl border border-[#F0D96B]/30" />
    </>
  );
}

export function AuthSidePanel({ appFeatures, title, compactOnMobile = false }) {
  const sectionClassName = compactOnMobile
    ? "relative overflow-hidden px-6 pt-8 sm:px-10 lg:px-12 lg:py-16"
    : "relative overflow-hidden px-6 py-10 sm:px-10 lg:px-12 lg:py-16";
  const contentClassName = compactOnMobile
    ? "relative z-10 flex h-full flex-col justify-start gap-3 lg:justify-between lg:gap-8"
    : "relative z-10 flex h-full flex-col justify-between gap-8";
  const mediaClassName = compactOnMobile ? "hidden lg:block" : "";
  const featuresClassName = compactOnMobile ? "hidden space-y-3 lg:block" : "space-y-3";

  return (
    <section className={sectionClassName}>
      <ShapeIllustration />

      <div className={contentClassName}>
        <div className="max-w-xl mt-4">
          <h1
            className=" text-5xl font-bold leading-none text-white sm:text-6xl"
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            {title}
          </h1>
          <span className="inline-flex items-center rounded-full py-2 font-['Fraunces'] text-xl font-light text-blue-100 sm:text-2xl">
            <img src="/favicon.svg" alt="" className="h-8 w-8 shrink-0" aria-hidden="true" />
            <span>iarEat</span>
          </span>
        </div>

        <div className={mediaClassName}>
          <img src={foodHero} alt="Food illustration" className="mx-auto h-96 w-auto object-contain" />
        </div>

        <ul className={featuresClassName}>
          {appFeatures?.map((p) => (
            <li key={p} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5E642]">
                <Check size={12} className="text-black" strokeWidth={3} />
              </div>

              <p className="text-md font-medium text-white/75">{p}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
