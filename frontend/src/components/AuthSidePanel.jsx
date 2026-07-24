import { Check } from "lucide-react";
import authSideShapes from "../assets/authside-shapes.svg";
import foodHero from "../assets/food-register.svg";

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
      <img
        src={authSideShapes}
        alt=""
        width="1440"
        height="900"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />

      <div className={contentClassName}>
        <div className="max-w-xl mt-4">
          <h1
            className=" text-5xl font-bold leading-none text-white sm:text-6xl"
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            {title}
          </h1>
          <span className="inline-flex items-center rounded-full py-2 font-['Fraunces'] text-xl font-light text-blue-100 sm:text-2xl">
            <img src="/favicon.svg" alt="" width="32" height="32" className="h-8 w-8 shrink-0" aria-hidden="true" />
            <span>iarEat</span>
          </span>
        </div>

        <div className={mediaClassName}>
          <img
            src={foodHero}
            alt="Food illustration"
            width="747"
            height="800"
            fetchPriority="high"
            className="mx-auto h-96 w-auto object-contain"
          />
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
