import { Link } from "react-router-dom";
import {
  Edit3,
  MapPin,
  MoreVertical,
  Star,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "./Modal";
import { PublishDiaryForm } from "./PublishDiaryForm";
import { useDeleteEntry } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";

function getLocation(restaurant) {
  return [
    restaurant?.barangay ? "Brgy. " + restaurant.barangay : null,
    restaurant?.city,
    restaurant?.province,
  ]
    .filter(Boolean)
    .join(", ");
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  if (hrs >= 1) return `${hrs}h ago`;
  if (mins >= 1) return `${mins}m ago`;

  return "Just Now";
}

function DeleteEntrySheet({ entry, onCancel, onDeleted }) {
  const deleteEntry = useDeleteEntry();
  const restaurantName = entry.restaurant?.name ?? "this place";

  async function handleDelete() {
    try {
      await deleteEntry.mutateAsync(entry.id);
      onDeleted?.();
    } catch {
      // The inline error state keeps the confirmation sheet open for retry.
    }
  }

  return (
    <div className="w-full max-w-md rounded-[28px] bg-[#FFFDF9] p-5 shadow-[0_20px_70px_rgba(28,17,7,0.18)]">
      <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold tracking-tight text-[#1C1107]">
        Delete Post?
      </h2>
      <p className="mt-3 font-['Plus_Jakarta_Sans'] text-sm leading-6 text-[#756450]">
        Are you sure you want to delete your visit to {restaurantName}? This
        action cannot be undone.
      </p>
      {deleteEntry.isError && (
        <p className="mt-3 text-sm font-semibold text-[#E04B39]">
          We couldn't delete this post. Please try again.
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleteEntry.isPending}
        className="mt-5 w-full rounded-2xl bg-[#E04B39] py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(224,75,57,0.25)] transition hover:bg-[#c93c2f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deleteEntry.isPending ? "Deleting..." : "Delete Post"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={deleteEntry.isPending}
        className="mt-3 w-full py-2 text-sm font-extrabold text-[#756450] transition hover:text-[#1C1107] disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
}

function EntryActions({ onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);

  function stopCardNavigation(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleEdit(e) {
    stopCardNavigation(e);
    setIsOpen(false);
    onEdit();
  }

  function handleDelete(e) {
    stopCardNavigation(e);
    setIsOpen(false);
    onDelete();
  }

  return (
    <div className="absolute right-3 top-3 z-20" onClick={stopCardNavigation}>
      <button
        type="button"
        onClick={(e) => {
          stopCardNavigation(e);
          setIsOpen((current) => !current);
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white shadow-[0_8px_24px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-black/55"
        aria-label="Post actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={17} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-40 overflow-hidden rounded-2xl border border-white/70 bg-white/95 py-1.5 shadow-[0_14px_38px_rgba(28,17,7,0.18)] backdrop-blur">
          <button
            type="button"
            onClick={handleEdit}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#1C1107] transition hover:bg-[#F7EFE5]"
          >
            <Edit3 size={15} />
            Edit
          </button>
          <div className="mx-3 my-1 h-px bg-[#EFE4D5]" />
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#D33B2F] transition hover:bg-[#FFF2E8]"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function EntryCard({ entry, featured = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const restaurant = entry.restaurant;
  const location = getLocation(restaurant);
  const wasEdited = Boolean(entry.updatedAt);
  const shouldCollapseCaption = (entry.caption?.length ?? 0) > 90;

  function toggleCaption(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsCaptionExpanded((current) => !current);
  }

  const card = (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#EEF2F7] bg-white shadow-none ${
        featured
          ? "flex h-[clamp(25rem,64dvh,31rem)] flex-col"
          : "flex h-[29rem] flex-col transition hover:-translate-y-0.5"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured ? "h-[clamp(13rem,34dvh,18rem)]" : "h-56"
        }`}
      >
        {entry.photoUrl ? (
          <img
            src={entry.photoUrl}
            alt={restaurant?.name ?? "Restaurant photo"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2A1E0F] to-[#3D2E18]">
            <UtensilsCrossed size={40} color="rgba(255,255,255,0.15)" />
          </div>
        )}
      </div>

      <div
        className={`${
          featured
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4"
            : "flex min-h-0 flex-1 flex-col px-4 py-3.5"
        }`}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <p
            className={`line-clamp-2 min-w-0 flex-1 overflow-hidden font-normal leading-snug text-warmGray-900 ${
              featured ? "text-2xl" : "text-xl"
            }`}
            style={{ fontFamily: '"Fraunces", serif' }}
          >
            {restaurant?.name ?? "Unknown restaurant"}
          </p>
          <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#253248]">
            <Star size={15} fill="#F4B21B" className="text-[#F4B21B]" />
            <p>
              {entry.rating != null ? Number(entry.rating).toFixed(1) : "-"}
            </p>
          </div>
        </div>

        <div className="flex min-h-5 items-center gap-2 font-['Plus_Jakarta_Sans'] text-xs font-medium leading-5 text-[#6F7892]">
          <MapPin size={12} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate py-px">
            {location || "No Location"}
          </span>
        </div>

        <div
          className={`mt-3 ${
            isCaptionExpanded
              ? "custom-scrollbar max-h-24 overflow-y-auto pr-1"
              : "min-h-[3.2rem] overflow-hidden"
          }`}
        >
          {entry.caption && (
            <div className="border-l-2 border-[#DDE5EF] pl-2.5">
              <p
                className={`font-['Plus_Jakarta_Sans'] text-sm leading-[1.6rem] text-[#5A4A34] ${
                  isCaptionExpanded ? "" : "line-clamp-2"
                }`}
              >
                {entry.caption}
              </p>
              {shouldCollapseCaption && (
                <button
                  type="button"
                  onClick={toggleCaption}
                  className="mt-0.5 font-['Plus_Jakarta_Sans'] text-xs font-extrabold text-[#E89951] transition hover:text-[#c93c2f]"
                >
                  {isCaptionExpanded ? "See Less" : "See More"}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-between gap-3 pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-[10px] tracking-wide text-stone-500">
            <span>{timeAgo(entry.visitedAt)}</span>
            {wasEdited && (
              <>
                <span
                  className="h-1 w-1 rounded-full bg-stone-400"
                  aria-hidden="true"
                />
                <span>Edited</span>
              </>
            )}
          </span>
          {restaurant?.category && (
            <span className="max-w-[55%] truncate rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
              {categoryLabel(restaurant.category)}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const actions = (
    <EntryActions
      onEdit={() => setIsEditing(true)}
      onDelete={() => setIsConfirmingDelete(true)}
    />
  );

  const modals = (
    <>
      {isEditing && (
        <Modal
          onClose={() => setIsEditing(false)}
          closeOnBackdrop={false}
          closeOnEscape={false}
        >
          <PublishDiaryForm entry={entry} onClose={() => setIsEditing(false)} />
        </Modal>
      )}
      {isConfirmingDelete && (
        <Modal onClose={() => setIsConfirmingDelete(false)} placement="center">
          <DeleteEntrySheet
            entry={entry}
            onCancel={() => setIsConfirmingDelete(false)}
            onDeleted={() => setIsConfirmingDelete(false)}
          />
        </Modal>
      )}
    </>
  );

  if (featured) {
    return (
      <div className="relative block h-full cursor-default no-underline">
        {card}
        {actions}
        {modals}
      </div>
    );
  }

  return (
    <div className="relative block h-full">
      <Link to={`/entries/${entry.id}`} className="block h-full no-underline">
        {card}
      </Link>
      {actions}
      {modals}
    </div>
  );
}
