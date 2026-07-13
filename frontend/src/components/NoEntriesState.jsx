import { Plus, UtensilsCrossed } from "lucide-react";

export function NoEntriesState({ message = "Add your first food place visit.", onAddPost }) {
  return (
    <div className="mx-auto w-fit rounded-2xl border border-[#E8DFC8] bg-stone-50 px-24 py-12 text-center">
      <UtensilsCrossed size={36} color="#C8B89A" className="mx-auto mb-3" />
      <p className="mb-1.5 text-xl text-[#1C1107]" style={{ fontFamily: '"Fraunces", serif' }}>
        No entries yet
      </p>
      <p className="mb-4 text-xs text-stone-500">{message}</p>
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
