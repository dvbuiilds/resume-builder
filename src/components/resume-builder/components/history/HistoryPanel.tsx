import React, { useCallback, useEffect, useMemo, useState, memo } from 'react';
import {
  MdOutlineAutoAwesomeMotion,
  MdOutlineRefresh,
  MdOutlineDescription,
  MdDelete,
} from 'react-icons/md';

import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import { parseErrorMessage } from '@resume-builder/components/resume-builder/utils/parseErrorMessage';
import {
  hydrateResumeFromHistory,
  resetResumeToInitial,
} from '@resume-builder/components/resume-builder/store/resumePersistence';

import { useHistory } from '../../context/HistoryContext';
import { useResumeStore } from '../../store/resumeStore';

// Constants
const API_TIMEOUT_MS = 5000;
const UNDO_TIMEOUT_MS = 5000;
const API_ENDPOINT = '/api/past-resumes';

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

// Utility functions
const formatUpdatedAt = (timestamp: number): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const normalizeErrorMessage = (
  err: unknown,
  defaultMessage: string,
): string => {
  const message = err instanceof Error ? err.message : defaultMessage;
  return /timed out|timeout/i.test(message)
    ? DEFAULT_ERROR_MESSAGE
    : message || DEFAULT_ERROR_MESSAGE;
};

// Types
interface DeletedResumeInfo {
  resumeId: string;
  rowId: string;
}

interface ResumeEntry {
  rowId: string;
  resumeId: string;
  data: string;
  updatedAt: number;
}

// Sub-components
const ErrorBanner: React.FC<{
  message: string;
  variant?: 'error' | 'warning';
}> = memo(({ message, variant = 'error' }) => {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <div className={`mb-4 rounded-md border px-3 py-2 text-xs ${styles}`}>
      {message}
    </div>
  );
});
ErrorBanner.displayName = 'ErrorBanner';

const UndoNotification: React.FC<{
  onUndo: () => void;
  isProcessing: boolean;
}> = memo(({ onUndo, isProcessing }) => (
  <div className="mb-4 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
    <span>Resume deleted</span>
    <button
      type="button"
      onClick={onUndo}
      className="font-semibold text-blue-700 underline hover:text-blue-800"
      disabled={isProcessing}
    >
      Undo
    </button>
  </div>
));
UndoNotification.displayName = 'UndoNotification';

const EmptyState: React.FC = memo(() => (
  <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
    <MdOutlineDescription className="text-4xl text-gray-400" />
    <p className="font-medium">No resumes saved yet</p>
    <p className="text-xs text-gray-400">
      Use the Save button to keep your current resume version.
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

interface ResumeItemProps {
  entry: ResumeEntry;
  index: number;
  isActive: boolean;
  isDeleting: boolean;
  onSelect: (rowId: string, resumeId: string, data: string) => void;
  onDelete: (e: React.MouseEvent, rowId: string, resumeId: string) => void;
}

const ResumeItem: React.FC<ResumeItemProps> = memo(
  ({ entry, index, isActive, isDeleting, onSelect, onDelete }) => {
    const containerStyles = isActive
      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner'
      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50';

    const iconStyles = isActive
      ? 'from-blue-500 to-blue-700 shadow-lg'
      : 'from-gray-400 to-gray-500';

    return (
      <div
        className={`flex items-center gap-3 rounded-lg border px-3 py-3 transition ${containerStyles}`}
      >
        <button
          type="button"
          onClick={() => onSelect(entry.rowId, entry.resumeId, entry.data)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white ${iconStyles}`}
          >
            <MdOutlineDescription className="text-2xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Resume {index + 1}</span>
            <span className="text-xs text-gray-500">
              last updated {formatUpdatedAt(entry.updatedAt)}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={(e) => onDelete(e, entry.rowId, entry.resumeId)}
          disabled={isDeleting || isActive}
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition hover:bg-red-100 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            isActive ? 'Cannot delete currently active resume' : 'Delete resume'
          }
        >
          {isDeleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          ) : (
            <MdDelete className="text-lg" />
          )}
        </button>
      </div>
    );
  },
);
ResumeItem.displayName = 'ResumeItem';

// Main component
export const HistoryPanel: React.FC = () => {
  const { entries, loading, error, refresh } = useHistory();
  const currentResumeId = useResumeStore((state) => state.resumeId);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletedResume, setDeletedResume] = useState<DeletedResumeInfo | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const emptyStateVisible = useMemo(
    () => !loading && entries.length === 0,
    [entries.length, loading],
  );

  const handleSelect = useCallback(
    (rowId: string, resumeId: string, data: string) => {
      setSelectionError(null);
      const hydrated = hydrateResumeFromHistory(data, resumeId);
      if (!hydrated) {
        setSelectionError(
          'Unable to load this resume. The saved data may be corrupted.',
        );
      }
    },
    [],
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent, rowId: string, resumeId: string) => {
      e.stopPropagation();
      setDeleteError(null);
      setDeletingId(resumeId);

      try {
        const response = await fetchWithTimeout(
          API_ENDPOINT,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ resumeId }),
          },
          API_TIMEOUT_MS,
        );

        if (!response.ok) {
          const message = await parseErrorMessage(response);
          throw new Error(message || 'Failed to delete resume');
        }

        const payload = (await response.json()) as { data?: unknown[] };
        if (Array.isArray(payload?.data)) {
          await refresh();
        }

        setDeletedResume({ resumeId, rowId });

        if (currentResumeId === resumeId) {
          resetResumeToInitial();
        }
      } catch (err) {
        setDeleteError(normalizeErrorMessage(err, 'Failed to delete resume.'));
      } finally {
        setDeletingId(null);
      }
    },
    [currentResumeId, refresh],
  );

  const handleUndo = useCallback(async () => {
    if (!deletedResume) return;

    setDeleteError(null);
    setDeletingId(deletedResume.resumeId);

    try {
      const response = await fetchWithTimeout(
        API_ENDPOINT,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ resumeId: deletedResume.resumeId }),
        },
        API_TIMEOUT_MS,
      );

      if (!response.ok) {
        const message = await parseErrorMessage(response);
        throw new Error(message || 'Failed to restore resume');
      }

      await refresh();
      setDeletedResume(null);
    } catch (err) {
      setDeleteError(normalizeErrorMessage(err, 'Failed to restore resume.'));
    } finally {
      setDeletingId(null);
    }
  }, [deletedResume, refresh]);

  useEffect(() => {
    if (!deletedResume) return;

    const timeoutId = setTimeout(() => {
      setDeletedResume(null);
    }, UNDO_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [deletedResume]);

  const showResumeList = !loading && !emptyStateVisible;

  return (
    <div className="relative h-full w-full overflow-y-auto rounded-md bg-white px-3 pb-2 scrollbar-hide">
      <header className="sticky top-0 z-10 mb-4 flex items-center justify-between bg-white py-2">
        <div className="flex items-center gap-2 text-gray-700">
          <MdOutlineAutoAwesomeMotion className="text-xl" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Past Resumes
          </h2>
        </div>
        <button
          type="button"
          onClick={() => refresh().catch(() => undefined)}
          className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200 disabled:opacity-60"
          disabled={loading}
        >
          <MdOutlineRefresh className="text-base" />
          Refresh
        </button>
      </header>

      {error && <ErrorBanner message={error} />}
      {selectionError && (
        <ErrorBanner message={selectionError} variant="warning" />
      )}
      {deleteError && <ErrorBanner message={deleteError} />}
      {deletedResume && (
        <UndoNotification
          onUndo={handleUndo}
          isProcessing={deletingId !== null}
        />
      )}

      <div className="space-y-3">
        {loading && (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            Loading past resumes...
          </div>
        )}

        {!loading && emptyStateVisible && <EmptyState />}

        {showResumeList &&
          entries.map((entry, index) => {
            const isActive = currentResumeId === entry.resumeId;
            const isDeleting = deletingId === entry.resumeId;
            return (
              <ResumeItem
                key={entry.rowId}
                entry={entry}
                index={index}
                isActive={isActive}
                isDeleting={isDeleting}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            );
          })}
      </div>
    </div>
  );
};
