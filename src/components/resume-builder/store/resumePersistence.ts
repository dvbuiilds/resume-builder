'use client';

import { v4 as uuidv4 } from 'uuid';

import { sanitizeResumeOutput } from '@resume-builder/components/resume-builder/types/pdf-transform-schema';

import type { ResumeOutput } from '../types/pdf-transform-schema';
import { useResumeStore } from './resumeStore';

const parseResumeData = (raw: string): ResumeOutput | null => {
  try {
    const parsed = JSON.parse(raw);
    return sanitizeResumeOutput(parsed);
  } catch (err) {
    console.warn('Failed to parse resume payload from history.', err);
    return null;
  }
};

export const getOrCreateResumeId = (): string => {
  const { resumeId, setResumeId } = useResumeStore.getState();
  if (resumeId) return resumeId;
  const nextId = uuidv4();
  setResumeId(nextId);
  return nextId;
};

export const getResumeSnapshotForSave = () => {
  const snapshot = useResumeStore.getState().getSnapshot();
  const resumeId = snapshot.resumeId || getOrCreateResumeId();
  return {
    resumeId,
    data: snapshot.data,
    serialized: JSON.stringify(snapshot.data),
  };
};

export const hydrateResumeFromHistory = (
  payload: string,
  resumeId: string,
): ResumeOutput | null => {
  const parsed = parseResumeData(payload);
  if (!parsed) {
    return null;
  }

  const store = useResumeStore.getState();
  store.setResumeId(resumeId);
  store.hydrate(parsed, resumeId);
  return parsed;
};

export const resetResumeToInitial = () => {
  useResumeStore.getState().resetToInitial();
};

export const resetResumeId = () => {
  useResumeStore.getState().setResumeId('');
};
