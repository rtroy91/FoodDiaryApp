import { useMemo, useState } from "react";
import { ConnectionErrorState } from "../components/ConnectionErrorState";
import { DiaryFab } from "../components/DiaryFab";
import { DiaryPageLayout, DiaryStatsGrid } from "../components/DiaryPageLayout";
import { EntryCard, EntryCardSkeleton } from "../components/EntryCard";
import { Modal } from "../components/Modal";
import { NoEntriesState } from "../components/NoEntriesState";
import { PublishDiaryForm } from "../components/PublishDiaryForm";
import { getCurrentUser } from "../api/auth";
import { useAllEntries } from "../hooks/useDiaryData";
import { getDiaryStats } from "../utils/diaryStats";

export function EntriesPage() {
  const { data: entries, isLoading, isError } = useAllEntries();
  const [showVisitModal, setShowVisitModal] = useState(false);

  const stats = useMemo(() => {
    return getDiaryStats(entries ?? []);
  }, [entries]);
  const currentUser = getCurrentUser();
  const userName = currentUser?.displayName || currentUser?.email?.split("@")[0] || "there";

  return (
    <>
      <DiaryPageLayout userName={userName} className="flex h-dvh flex-col">
        <div className="mx-auto w-full max-w-140 shrink-0 px-4">
          <DiaryStatsGrid stats={stats} loading={isLoading} className="mb-6" />
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-4 pb-4">
          <div className="mb-3 flex shrink-0 items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-700">All posts</span>
          </div>

          {isLoading && (
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 pr-1">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[3, 1, 2, 3, 1, 2].map((captionLines, index) => (
                  <EntryCardSkeleton key={`${captionLines}-${index}`} captionLines={captionLines} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && isError && (
            <div className="mx-auto w-full max-w-140">
              <ConnectionErrorState />
            </div>
          )}

          {!isLoading && !isError && !entries?.length && (
            <div className="mx-auto w-full max-w-140">
              <NoEntriesState />
            </div>
          )}

          {!isLoading && !isError && entries?.length > 0 && (
            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pb-24 pr-1">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>

        {!isLoading && <DiaryFab onLogEntry={() => setShowVisitModal(true)} />}
      </DiaryPageLayout>
      {showVisitModal && (
        <Modal onClose={() => setShowVisitModal(false)} closeOnBackdrop={false} closeOnEscape={false}>
          <PublishDiaryForm onClose={() => setShowVisitModal(false)} />
        </Modal>
      )}
    </>
  );
}
