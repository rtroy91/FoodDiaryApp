import deadlinkEmoji from "../assets/deadlink-emoji.svg";

export function SessionLoadingState() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F5F0E8] px-5 py-10">
      <section className="text-center" aria-live="polite" aria-busy="true">
        <img
          src={deadlinkEmoji}
          alt=""
          width="112"
          height="112"
          className="mx-auto mb-5 h-28 w-28 animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        />
        <p className="mx-auto max-w-xs text-sm font-semibold leading-6 text-[#5F4A37]">
          Scanning the buffet line to make sure you're still logged in…
        </p>
      </section>
    </main>
  );
}
