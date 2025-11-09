'use client';

import React, { useMemo, useState } from 'react';
import {
  MdOutlineAutoAwesomeMotion,
  MdOutlineRefresh,
  MdOutlineDescription,
} from 'react-icons/md';

import { hydrateResumeFromHistory } from '@/components/resume-builder/store/resumePersistence';

import { useHistory } from '../../context/HistoryContext';
import { useResumeStore } from '../../store/resumeStore';

const formatUpdatedAt = (timestamp: number) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

export const HistoryPanel: React.FC = () => {
  const { entries, loading, error, refresh } = useHistory();
  const currentResumeId = useResumeStore((state) => state.resumeId);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const emptyStateVisible = useMemo(
    () => !loading && entries.length === 0,
    [entries.length, loading],
  );

  const handleSelect = (rowId: string, resumeId: string, data: string) => {
    setSelectionError(null);
    const hydrated = hydrateResumeFromHistory(data, resumeId);
    if (!hydrated) {
      setSelectionError(
        'Unable to load this resume. The saved data may be corrupted.',
      );
    }
  };

  return (
    <div className="h-full w-full bg-white">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 text-gray-700">
          <MdOutlineAutoAwesomeMotion className="text-xl" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Past Resumes
          </h2>
        </div>
        <button
          type="button"
          onClick={() => refresh().catch(() => undefined)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
          disabled={loading}
        >
          <MdOutlineRefresh className="text-base" />
          Refresh
        </button>
      </header>

      <div className="flex flex-col h-[calc(100%-56px)] overflow-y-auto px-4 py-4 gap-3">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Loading past resumes...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {!loading && selectionError ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
            {selectionError}
          </div>
        ) : null}

        {emptyStateVisible ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
            <div>
              <MdOutlineDescription className="mx-auto mb-2 text-4xl text-gray-400" />
              <p className="font-medium">No resumes saved yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Use the Save button to keep your current resume version.
              </p>
            </div>
          </div>
        ) : null}

        {!emptyStateVisible
          ? entries.map((entry, index) => {
              const isActive = currentResumeId === entry.resumeId;
              return (
                <button
                  key={entry.rowId}
                  type="button"
                  onClick={() =>
                    handleSelect(entry.rowId, entry.resumeId, entry.data)
                  }
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-inner'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-white ${
                      isActive
                        ? 'from-blue-500 to-blue-700 shadow-lg'
                        : 'from-gray-400 to-gray-500'
                    }`}
                  >
                    <MdOutlineDescription className="text-2xl" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      Resume {index + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      last updated {formatUpdatedAt(entry.updatedAt)}
                    </span>
                  </div>
                </button>
              );
            })
          : null}
      </div>
    </div>
  );
};
