import Skeleton from "react-loading-skeleton";
import { Link } from "react-router-dom";
import { Clock, Edit3, MapPin, MoreVertical, Star, Trash2, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { PublishDiaryForm } from "./PublishDiaryForm";
import { useDeleteEntry } from "../hooks/useDiaryData";
import { categoryLabel } from "../utils/restaurants";

function getLocation(restaurant) {
  return [restaurant?.barangay ? "Brgy. " + restaurant.barangay : null, restaurant?.city, restaurant?.province]
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

export function EntryCardSkeleton({ featured = false, captionLines = 2 }) {
  const captionWidths = featured
    ? ["62%", "44%"]
    : ["84%", captionLines > 1 ? "66%" : null, captionLines > 2 ? "46%" : null].filter(Boolean);

  return (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#EEF2F7] bg-white shadow-none ${
        featured ? "flex h-[clamp(25rem,64dvh,31rem)] flex-col" : "flex h-116 flex-col"
      }`}
      aria-hidden="true"
    >
      <div className={`shrink-0 overflow-hidden ${featured ? "h-[clamp(13rem,34dvh,18rem)]" : "h-56"}`}>
        <Skeleton
          containerClassName="block h-full w-full"
          className="block h-full w-full"
          height="100%"
          borderRadius={0}
          baseColor="#e7dfd2"
          highlightColor="#f8f4ec"
        />
      </div>

      <div
        className={`${
          featured
            ? "flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-4"
            : "flex min-h-0 flex-1 flex-col px-4 py-3.5"
        }`}
      >
        <div className="mb-1 flex items-start justify-between gap-3">
          <Skeleton
            width={featured ? 160 : 128}
            height={featured ? 24 : 20}
            borderRadius={6}
            baseColor="#e7dfd2"
            highlightColor="#f8f4ec"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <Star size={15} fill="#F4B21B" className="text-[#F4B21B]" />
            <Skeleton width={28} height={16} borderRadius={6} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
          </div>
        </div>

        <div className="flex min-h-5 items-center gap-2">
          <MapPin size={12} className="shrink-0 text-[#6F7892]" />
          <Skeleton
            width={featured ? 96 : 120}
            height={14}
            borderRadius={6}
            baseColor="#f0ebe2"
            highlightColor="#fbf8f2"
          />
        </div>

        <div className="mt-3 h-[3.2rem] overflow-hidden border-l-2 border-[#DDE5EF] pl-2.5">
          {captionWidths.map((width, index) => (
            <Skeleton
              key={width}
              className={index === 0 ? "block" : "mt-2 block"}
              width={width}
              height={14}
              borderRadius={6}
              baseColor="#f0ebe2"
              highlightColor="#fbf8f2"
            />
          ))}
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-between gap-3 pt-3">
          <Skeleton width={48} height={12} borderRadius={6} baseColor="#f0ebe2" highlightColor="#fbf8f2" />
          <Skeleton width={48} height={24} borderRadius={999} baseColor="#e7dfd2" highlightColor="#f8f4ec" />
        </div>
      </div>
    </div>
  );
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
      <h2 className="text-lg font-extrabold tracking-tight text-[#1C1107]">Delete Post?</h2>
      <p className="mt-3 text-sm leading-6 text-[#756450]">
        Are you sure you want to delete your visit to {restaurantName}? This action cannot be undone.
      </p>
      {deleteEntry.isError && (
        <p className="mt-3 text-sm font-semibold text-[#E04B39]">We couldn't delete this post. Please try again.</p>
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

function EntryActions({ onEdit, onDelete, tone = "photo", placement = "photo" }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const isPanelTone = tone === "panel";
  const isInlinePlacement = placement === "inline";

  useEffect(() => {
    if (!isOpen) return undefined;

    function closeOnOutsidePointerDown(e) {
      if (!menuRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown, true);
  }, [isOpen]);

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
    <div
      ref={menuRef}
      className={isInlinePlacement ? "relative z-20 shrink-0" : "absolute right-3 top-3 z-20"}
      onClick={stopCardNavigation}
    >
      <button
        type="button"
        onClick={(e) => {
          stopCardNavigation(e);
          setIsOpen((current) => !current);
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0E76F] ${
          isPanelTone
            ? "bg-stone-200 text-[#1C1107] ring-1 ring-stone-300/70 hover:bg-stone-300"
            : "bg-black/40 text-white backdrop-blur-sm hover:bg-black/55"
        }`}
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
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-bold text-[#1C1107] transition hover:bg-[#F7EFE5]"
          >
            <Edit3 size={15} />
            Edit
          </button>
          <div className="mx-3 my-1 h-px bg-[#EFE4D5]" />
          <button
            type="button"
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-bold text-[#D33B2F] transition hover:bg-[#FFF2E8]"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function EntryDetailModal({ entry, location, onClose, onEdit, onDelete }) {
  const restaurant = entry.restaurant;
  const entryDetailsPath = `/entries/${entry.id}`;

  function handleRestaurantLinkClick(event) {
    event.stopPropagation();
    onClose();
  }

  return (
    <Modal onClose={onClose} placement="center" backdropClassName="bg-black/60 px-4 py-6 backdrop-blur-md sm:py-8">
      <article
        className="entry-detail-modal relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-[#FFFDF9] shadow-[0_30px_90px_rgba(0,0,0,0.34)] outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`entry-detail-title-${entry.id}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 justify-end gap-2 px-6 pb-2 pt-4 xl:absolute xl:right-6 xl:top-6 xl:z-30 xl:p-0">
          <EntryActions onEdit={onEdit} onDelete={onDelete} tone="panel" placement="inline" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-[#1C1107] shadow-[0_8px_24px_rgba(0,0,0,0.16)] ring-1 ring-stone-300/70 transition hover:bg-stone-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F0E76F]"
            aria-label="Close details"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden px-4 pb-4 pt-0 sm:px-6 sm:pb-6 xl:grid-cols-2 xl:items-stretch xl:gap-8 xl:p-6">
          <div className="relative h-[min(42vh,350px)] w-full shrink-0 overflow-hidden rounded-2xl bg-[#1C1107] md:h-[min(44vh,400px)] xl:aspect-square xl:h-auto">
            {entry.photoUrl ? (
              <img
                src={entry.photoUrl}
                alt={restaurant?.name ?? "Restaurant photo"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#2A1E0F] to-[#3D2E18]">
                <UtensilsCrossed size={54} color="rgba(255,255,255,0.16)" />
              </div>
            )}
          </div>

          <div className="flex min-h-0 flex-col justify-between">
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-start justify-between gap-4 xl:pr-20">
                {restaurant?.id || entry.restaurantId ? (
                  <Link
                    id={`entry-detail-title-${entry.id}`}
                    to={entryDetailsPath}
                    onClick={handleRestaurantLinkClick}
                    className="min-w-0 flex-1 text-3xl font-normal leading-tight text-[#1C1107] underline-offset-4 transition hover:text-[#6F5130] hover:underline"
                    style={{ fontFamily: '"Fraunces", serif' }}
                    aria-label={`Open entry details for ${restaurant?.name ?? "this restaurant"}`}
                  >
                    {restaurant?.name ?? "Unknown restaurant"}
                  </Link>
                ) : (
                  <h2
                    id={`entry-detail-title-${entry.id}`}
                    className="min-w-0 flex-1 text-3xl font-normal leading-tight text-[#1C1107]"
                    style={{ fontFamily: '"Fraunces", serif' }}
                  >
                    {restaurant?.name ?? "Unknown restaurant"}
                  </h2>
                )}
              </div>

              <div className="mt-3 shrink-0 space-y-2 text-sm font-medium leading-5 text-[#6F7892]">
                <div className="flex items-center gap-2 font-semibold text-[#253248]">
                  <Star size={17} fill="#F4B21B" className="text-[#F4B21B]" />
                  <span>{entry.rating != null ? Number(entry.rating).toFixed(1) : "-"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" />
                  <span>{location || "No Location"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={15} className="shrink-0" />
                  <span>{timeAgo(entry.visitedAt)}</span>
                </div>
              </div>

              <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-[#E6DED1] pt-5">
                <div className="custom-scrollbar min-h-0 grow overflow-y-auto pr-2">
                  <p className="text-[0.95rem] leading-7 text-[#5A4A34]">
                    {entry.caption || "No written note for this visit yet."}
                  </p>
                </div>
              </div>
            </div>

            {restaurant?.category && (
              <div className="mt-5 flex shrink-0 justify-start xl:justify-end">
                <span className="inline-flex rounded-full border border-[#DDE5EF] bg-[#F7FAFD] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#1C2A3D] shadow-[0_2px_8px_rgba(28,42,61,0.08)]">
                  {categoryLabel(restaurant.category)}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Modal>
  );
}

export function EntryCard({ entry, featured = false }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [shouldReturnToDetails, setShouldReturnToDetails] = useState(false);
  const restaurant = entry.restaurant;
  const location = getLocation(restaurant);
  const wasEdited = Boolean(entry.updatedAt);

  function openDetails() {
    setIsViewingDetails(true);
  }

  function handleCardKeyDown(e) {
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDetails();
    }
  }

  function closeEditing() {
    setIsEditing(false);
    if (shouldReturnToDetails) {
      setShouldReturnToDetails(false);
      setIsViewingDetails(true);
    }
  }

  function cancelDelete() {
    setIsConfirmingDelete(false);
    if (shouldReturnToDetails) {
      setShouldReturnToDetails(false);
      setIsViewingDetails(true);
    }
  }

  function finishDelete() {
    setShouldReturnToDetails(false);
    setIsConfirmingDelete(false);
  }

  const card = (
    <div
      className={`overflow-hidden rounded-[20px] border border-[#EEF2F7] bg-white shadow-none transition ${
        featured ? "flex h-[clamp(25rem,64dvh,31rem)] flex-col" : "flex h-116 flex-col hover:-translate-y-0.5"
      }`}
    >
      <div className={`relative shrink-0 overflow-hidden ${featured ? "h-[clamp(13rem,34dvh,18rem)]" : "h-56"}`}>
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
            <p>{entry.rating != null ? Number(entry.rating).toFixed(1) : "-"}</p>
          </div>
        </div>

        <div className="flex min-h-5 items-center gap-2 text-xs font-medium leading-5 text-[#6F7892]">
          <MapPin size={12} className="shrink-0" />
          <span className="min-w-0 flex-1 truncate py-px">{location || "No Location"}</span>
        </div>

        <div className="mt-3 h-[3.2rem] overflow-hidden">
          {entry.caption && (
            <div className="border-l-2 border-[#DDE5EF] pl-2.5">
              <p className="line-clamp-2 text-sm leading-[1.6rem] text-[#5A4A34]">{entry.caption}</p>
            </div>
          )}
        </div>

        <div className="mt-auto flex shrink-0 items-center justify-between gap-3 pt-3">
          <span className="flex min-w-0 items-center gap-1.5 text-[10px] tracking-wide text-stone-500">
            <span>{timeAgo(entry.visitedAt)}</span>
            {wasEdited && (
              <>
                <span className="h-1 w-1 rounded-full bg-stone-400" aria-hidden="true" />
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

  const actions = <EntryActions onEdit={() => setIsEditing(true)} onDelete={() => setIsConfirmingDelete(true)} />;

  const modals = (
    <>
      {isEditing && (
        <Modal onClose={closeEditing} closeOnBackdrop={false} closeOnEscape={false}>
          <PublishDiaryForm entry={entry} onClose={closeEditing} />
        </Modal>
      )}
      {isConfirmingDelete && (
        <Modal onClose={cancelDelete} placement="center" closeOnBackdrop={false}>
          <DeleteEntrySheet entry={entry} onCancel={cancelDelete} onDeleted={finishDelete} />
        </Modal>
      )}
      {isViewingDetails && (
        <EntryDetailModal
          entry={entry}
          location={location}
          onClose={() => setIsViewingDetails(false)}
          onEdit={() => {
            setShouldReturnToDetails(true);
            setIsViewingDetails(false);
            setIsEditing(true);
          }}
          onDelete={() => {
            setShouldReturnToDetails(true);
            setIsViewingDetails(false);
            setIsConfirmingDelete(true);
          }}
        />
      )}
    </>
  );

  if (featured) {
    return (
      <div
        className="relative block h-full cursor-pointer no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0E76F]"
        role="button"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={handleCardKeyDown}
        aria-label={`Open details for ${restaurant?.name ?? "entry"}`}
      >
        {card}
        {actions}
        {modals}
      </div>
    );
  }

  return (
    <div
      className="relative block h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F0E76F]"
      role="button"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      aria-label={`Open details for ${restaurant?.name ?? "entry"}`}
    >
      {card}
      {actions}
      {modals}
    </div>
  );
}
