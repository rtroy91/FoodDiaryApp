import { Plus, UtensilsCrossed } from "lucide-react";

export function NoEntriesState({
  message = "Your map is empty and your stomach is filing noise complaints. Drop your first food spot below!",
  onAddPost,
}) {
  return (
    <div className="mx-auto w-fit rounded-2xl border border-[#E8DFC8] bg-stone-50 px-20 py-12 text-center">
      <UtensilsCrossed size={36} className="mx-auto mb-3 text-stone-600" />
      <p className="mb-1.5 text-xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
        No entries yet
      </p>
      <p className="mb-4 text-xs text-stone-600">{message}</p>
      {onAddPost && (
        <button
          type="button"
          onClick={onAddPost}
          className="mx-auto flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#E04B39] py-3.5 text-sm font-semibold text-white transition hover:bg-[#c93c2f]"
        >
          <Plus size={16} />
          Add Post
        </button>
      )}
    </div>
  );
}
