import { Link } from "react-router-dom";
import deadlinkEmoji from "../assets/deadlink-emoji.svg";

export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F5F0E8] px-4 py-12">
      <section className="w-full max-w-md text-center">
        <img
          src={deadlinkEmoji}
          alt=""
          className="mx-auto mb-6 flex items-center justify-center h-48 w-48"
          aria-hidden="true"
        />

        <h1
          className="mt-2 text-4xl font-light leading-tight text-[#1C1107]"
          style={{ fontFamily: '"Fraunces", serif' }}
        >
          Are you lost?
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm font-medium leading-6 text-stone-700">
          Are you sure? Did you type it wrong? Check it. Check it again. Just go home already. Go on. Click it.
        </p>

        <Link
          to="/"
          replace
          className="mx-auto mt-7 inline-flex h-12 items-center justify-center rounded-full bg-[#B83224] px-6 text-sm font-bold text-white no-underline shadow-[0_14px_32px_rgba(184,50,36,0.22)] transition hover:bg-[#8F261C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
        >
          Back to Home
        </Link>
      </section>
    </div>
  );
}
