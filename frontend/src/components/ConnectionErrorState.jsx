export function ConnectionErrorState({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-[#E04B39]/20 bg-stone-50 px-5 py-4 text-sm text-[#8A2A1C] ${className}`}>
      Lost connection to the pantry. The servers are in a deep food coma. Give us a moment to wake them up!
    </div>
  );
}
