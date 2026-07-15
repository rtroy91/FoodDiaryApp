import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ConnectionErrorState } from "../components/ConnectionErrorState";
import { DiaryFab } from "../components/DiaryFab";
import { DiaryPageLayout, DiaryStatsGrid } from "../components/DiaryPageLayout";
import { EntryCard, EntryCardSkeleton } from "../components/EntryCard";
import { Modal } from "../components/Modal";
import { NoEntriesState } from "../components/NoEntriesState";
import { PublishDiaryForm } from "../components/PublishDiaryForm";
import { getCurrentUser } from "../api/auth";
import { useAllEntries, useRecentEntries } from "../hooks/useDiaryData";
import { getDiaryStats } from "../utils/diaryStats";

function getPaginationDotClass(index, activeIndex, total) {
  const distance = Math.min(Math.abs(index - activeIndex), total - Math.abs(index - activeIndex));

  if (distance === 0) return "h-2 w-5 bg-[#B83224]";
  if (distance === 1) return "h-2 w-2 bg-stone-700";

  return "h-1.5 w-1.5 bg-stone-500";
}

function getCarouselMotionClass(motion) {
  if (motion === "exit-next") return "-translate-x-5 opacity-0";
  if (motion === "exit-previous") return "translate-x-5 opacity-0";
  if (motion === "enter-next") return "translate-x-5 opacity-0";
  if (motion === "enter-previous") return "-translate-x-5 opacity-0";

  return "translate-x-0 opacity-100";
}

export function FeaturedPage() {
  const { data: entries, isLoading: loadingEntries, isError: isEntriesError } = useRecentEntries(10);
  const { data: allEntries, isLoading: loadingAllEntries } = useAllEntries();

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [activeEntryIndex, setActiveEntryIndex] = useState(0);
  const [carouselMotion, setCarouselMotion] = useState("idle");
  const carouselTimerRef = useRef(null);

  const stats = useMemo(() => {
    return getDiaryStats(allEntries ?? []);
  }, [allEntries]);
  const currentUser = getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";
  const recentEntries = entries ?? [];
  const activeEntry = recentEntries.length > 0 ? recentEntries[activeEntryIndex % recentEntries.length] : null;

  useEffect(() => {
    return () => {
      if (carouselTimerRef.current) {
        window.clearTimeout(carouselTimerRef.current);
      }
    };
  }, []);

  function moveEntry(direction) {
    if (recentEntries.length <= 1 || carouselMotion !== "idle") return;

    setCarouselMotion(`exit-${direction}`);

    carouselTimerRef.current = window.setTimeout(() => {
      setActiveEntryIndex((current) => {
        if (!recentEntries.length) return 0;

        return direction === "next"
          ? (current + 1) % recentEntries.length
          : (current - 1 + recentEntries.length) % recentEntries.length;
      });

      setCarouselMotion(`enter-${direction}`);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setCarouselMotion("idle"));
      });
    }, 120);
  }

  function showPreviousEntry() {
    moveEntry("previous");
  }

  function showNextEntry() {
    moveEntry("next");
  }

  return (
    <>
      <DiaryPageLayout userName={userName}>
        <div className="mx-auto max-w-140 px-4">
          <DiaryStatsGrid stats={stats} loading={loadingAllEntries} />

          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">Recent post</span>
          </div>

          {loadingEntries && (
            <div className="relative left-1/2 w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 pb-2">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
                <button
                  type="button"
                  disabled
                  aria-label="Show previous entry"
                  className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248]"
                >
                  <ChevronLeft size={20} />
                </button>

                <EntryCardSkeleton featured />

                <button
                  type="button"
                  disabled
                  aria-label="Show next entry"
                  className="pointer-events-none flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248]"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1">
                {[0, 1, 2, 3, 4].map((dot) => (
                  <span
                    key={dot}
                    className={`rounded-full ${dot === 2 ? "h-2 w-5 bg-[#B83224]" : "h-2 w-2 bg-stone-500"}`}
                  />
                ))}
              </div>
            </div>
          )}

          {!loadingEntries && isEntriesError && <ConnectionErrorState />}

          {!loadingEntries && !isEntriesError && !entries?.length && <NoEntriesState />}

          {!loadingEntries && !isEntriesError && activeEntry && (
            <div className="relative left-1/2 w-[min(calc(100vw-2rem),34rem)] -translate-x-1/2 pb-2">
              <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3">
                <button
                  type="button"
                  onClick={showPreviousEntry}
                  disabled={carouselMotion !== "idle"}
                  aria-label="Show previous entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] transition hover:bg-[#F7FAFD] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <ChevronLeft size={20} />
                </button>

                <div
                  className={`min-w-0 transform-gpu transition-[opacity,transform] duration-200 ease-out ${getCarouselMotionClass(
                    carouselMotion
                  )}`}
                >
                  <EntryCard entry={activeEntry} featured />
                </div>

                <button
                  type="button"
                  onClick={showNextEntry}
                  disabled={carouselMotion !== "idle"}
                  aria-label="Show next entry"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#DDE5EF] bg-white text-[#253248] transition hover:bg-[#F7FAFD] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1">
                {recentEntries.map((entry, index) => {
                  const isActive = index === activeEntryIndex % recentEntries.length;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => setActiveEntryIndex(index)}
                      aria-label={`Show entry ${index + 1}`}
                      aria-current={isActive ? "true" : undefined}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[#E8DFC8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E04B39]/35"
                    >
                      <span
                        className={`rounded-full transition-all duration-300 ${getPaginationDotClass(
                          index,
                          activeEntryIndex % recentEntries.length,
                          recentEntries.length
                        )}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!loadingEntries && <DiaryFab onLogEntry={() => setShowVisitModal(true)} />}
      </DiaryPageLayout>
      {showVisitModal && (
        <Modal onClose={() => setShowVisitModal(false)} closeOnBackdrop={false} closeOnEscape={false}>
          <PublishDiaryForm onClose={() => setShowVisitModal(false)} />
        </Modal>
      )}
    </>
  );
}
