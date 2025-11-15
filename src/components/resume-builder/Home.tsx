'use client';

import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import pdfToText from 'react-pdftotext';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FaUpload, FaGripVertical, FaHistory, FaGithub } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

import { useResumeStore } from '@resume-builder/components/resume-builder/store/resumeStore';
import { useUserResumeStore } from '@resume-builder/components/resume-builder/store/userResumeStore';
import { getUserResumes } from '@resume-builder/components/resume-builder/utils/userResumeData';
import type { ResumeOutput } from '@resume-builder/components/resume-builder/types/pdf-transform-schema';
import fetchWithTimeout from '@resume-builder/utils/fetchWithTimeout';
import {
  getOrCreateResumeId,
  resetResumeToInitial,
} from '@resume-builder/components/resume-builder/store/resumePersistence';

const API_TIMEOUT_MS = 120_000;
const PENDING_UPLOAD_KEY = 'resumeBuilder.pendingUpload';

type PendingUpload = {
  extractedText: string;
  fileDataUrl: string | null;
  fileName: string | null;
  fileType: string | null;
};

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file as data URL.'));
    reader.readAsDataURL(file);
  });

const getSessionStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const restoreFileFromDataUrl = async (
  dataUrl: string,
  fileName: string | null,
  fileType: string | null,
): Promise<File | null> => {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName ?? 'resume.pdf', {
      type: fileType ?? blob.type ?? 'application/pdf',
    });
  } catch (err) {
    console.warn('Unable to restore uploaded file after login.', err);
    return null;
  }
};

const deserializePendingUpload = (raw: string | null): PendingUpload | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingUpload;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      extractedText:
        typeof parsed.extractedText === 'string' ? parsed.extractedText : '',
      fileDataUrl:
        typeof parsed.fileDataUrl === 'string' ? parsed.fileDataUrl : null,
      fileName: typeof parsed.fileName === 'string' ? parsed.fileName : null,
      fileType: typeof parsed.fileType === 'string' ? parsed.fileType : null,
    };
  } catch (err) {
    console.warn('Failed to parse pending upload from storage.', err);
    return null;
  }
};

const Home: React.FC = () => {
  const router = useRouter();
  const { status: authStatus } = useSession();
  const hydrateResume = useResumeStore((state) => state.hydrate);
  const resumeCount = useUserResumeStore((state) => state.resumeCount);

  const [extractedText, setExtractedText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storage = useMemo(() => getSessionStorage(), []);
  const isAuthenticated = authStatus === 'authenticated';
  const hasRestoredUpload = useRef(false);

  const persistPendingUpload = useCallback(
    (data: PendingUpload | null) => {
      if (!storage) return;
      if (!data) {
        storage.removeItem(PENDING_UPLOAD_KEY);
        return;
      }
      try {
        storage.setItem(PENDING_UPLOAD_KEY, JSON.stringify(data));
      } catch (err) {
        console.warn('Unable to persist pending upload.', err);
      }
    },
    [storage],
  );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event?.target?.files?.[0];
      setSelectedFile(file ?? null);
      setFileDataUrl(null);
      setError(null);

      if (!file) {
        setExtractedText('');
        persistPendingUpload(null);
        return;
      }

      setIsExtracting(true);
      try {
        const [text, dataUrl] = await Promise.all([
          pdfToText(file),
          readFileAsDataUrl(file),
        ]);

        setExtractedText(text);
        setFileDataUrl(dataUrl);

        if (!isAuthenticated) {
          persistPendingUpload({
            extractedText: text,
            fileDataUrl: dataUrl,
            fileName: file.name ?? null,
            fileType: file.type ?? null,
          });
        } else {
          persistPendingUpload(null);
        }
      } catch (err) {
        console.error('Failed to extract text from PDF:', err);
        setExtractedText('');
        setFileDataUrl(null);
        setError(
          'We could not read this PDF file. Please try another file or try again.',
        );
        persistPendingUpload(null);
      } finally {
        setIsExtracting(false);
      }
    },
    [isAuthenticated],
  );

  const handleCreateResume = useCallback(async () => {
    if (!isAuthenticated) {
      const message = 'Please sign in to create a resume.';
      setError(message);
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
      if (extractedText && fileDataUrl && selectedFile) {
        persistPendingUpload({
          extractedText,
          fileDataUrl,
          fileName: selectedFile.name ?? null,
          fileType: selectedFile.type ?? null,
        });
      }
      return;
    }

    if (isCreating) return;

    setError(null);

    resetResumeToInitial();
    persistPendingUpload(null);

    const newResumeId = getOrCreateResumeId();
    const trimmedText = extractedText.trim();

    if (!trimmedText) {
      setIsCreating(false);
      router.push('/resume-builder');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetchWithTimeout(
        '/api/transform-pdf-string',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: trimmedText }),
        },
        API_TIMEOUT_MS,
      );

      const payload = (await response.json()) as {
        data?: ResumeOutput;
        error?: string;
      };

      if (!response.ok || !payload?.data) {
        const message =
          payload?.error ?? 'Unable to generate resume from the uploaded file.';
        throw new Error(message);
      }

      hydrateResume(payload.data, newResumeId);
      router.push('/resume-builder');
    } catch (err) {
      console.error('Failed to create resume:', err);
      setError('Something went wrong while creating your resume.');
    } finally {
      setIsCreating(false);
    }
  }, [extractedText, fileDataUrl, isAuthenticated, isCreating]);

  const handleContinueExisting = useCallback(() => {
    setError(null);
    router.push('/resume-builder');
  }, [router]);

  const restorePendingUpload = useCallback(async () => {
    if (!storage || hasRestoredUpload.current) return;

    hasRestoredUpload.current = true;

    const raw = storage.getItem(PENDING_UPLOAD_KEY);
    if (!raw) return;

    const stored = deserializePendingUpload(raw);
    storage.removeItem(PENDING_UPLOAD_KEY);

    if (!stored) return;

    if (stored.extractedText) {
      setExtractedText(stored.extractedText);
    }

    if (stored.fileDataUrl) {
      const restoredFile = await restoreFileFromDataUrl(
        stored.fileDataUrl,
        stored.fileName,
        stored.fileType,
      );
      if (restoredFile) {
        setSelectedFile(restoredFile);
        setFileDataUrl(stored.fileDataUrl);
      } else {
        setSelectedFile(null);
        setFileDataUrl(null);
      }
    }
  }, [storage]);

  useEffect(() => {
    if (!isAuthenticated) return;
    restorePendingUpload();
    // Ensure user resumes are loaded when authenticated
    // Note: useUserResumeSync hook will also handle this, but this ensures it's loaded for button visibility
    getUserResumes().catch(() => {
      // Silently fail - useUserResumeSync hook will also handle this
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isButtonDisabled =
    isExtracting || isCreating || authStatus === 'loading';

  // Only show "Continue Existing Resume" button if user has at least one resume
  const showContinueButton = isAuthenticated && resumeCount > 0;

  return (
    <>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-center text-4xl font-bold mb-2">Resume Builder</h1>
        <p className="text-center text-gray-600 mb-10">
          Build a standout resume in minutes by uploading your latest CV PDF or
          your LinkedIn profile.
        </p>
        <div className="flex flex-col sm:flex-row gap-10 justify-center mb-10">
          <div className="flex-1 min-w-[300px] md:min-w-[340px] max-w-lg bg-gray-100 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg mb-4">
              Upload your Resume or LinkedIn Profile PDF:
            </h2>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="block text-sm text-gray-800 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer file:mr-4"
            />
            <p className="mt-3 text-xs text-gray-500">
              Supported formats: Resume PDF, LinkedIn profile PDF export, or any
              CV PDF.
            </p>
            {selectedFile ? (
              <p className="mt-2 text-xs text-gray-600">
                Selected file:{' '}
                <span className="font-medium">{selectedFile.name}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <button
            onClick={handleCreateResume}
            className="flex-1 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 flex justify-center items-center gap-3"
            disabled={isButtonDisabled}
          >
            {isCreating ? (
              <span className="inline-flex items-center gap-3">
                <span className="animate-spin w-6 h-6 border-4 border-white border-t-blue-600 rounded-full inline-block" />
                Creating Resume...
              </span>
            ) : (
              'Create New Resume'
            )}
          </button>
          {showContinueButton ? (
            <button
              onClick={handleContinueExisting}
              className="flex-1 py-4 bg-gray-200 text-gray-800 text-lg font-semibold rounded-lg shadow-md hover:bg-gray-300 transition"
            >
              Continue Existing
            </button>
          ) : null}
        </div>
        {error ? (
          <div
            role="alert"
            className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        ) : null}
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto mt-20 mb-16 px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose Our Resume Builder
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1: Upload Resume/LinkedIn PDF */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-blue-600">
              <FaUpload size={48} />
            </div>
            <h3 className="font-bold text-lg mb-3">Upload PDF Resume</h3>
            <p className="text-gray-600 text-sm text-justify">
              Transform your existing resume or LinkedIn profile PDF into a
              professional resume builder format. Our AI-powered resume
              generator extracts and structures your content instantly.
            </p>
          </div>

          {/* Feature 2: Drag and Drop Sections */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-blue-600">
              <FaGripVertical size={48} />
            </div>
            <h3 className="font-bold text-lg mb-3">Drag & Drop Sections</h3>
            <p className="text-gray-600 text-sm text-justify">
              Easily reorder and customize your resume sections with intuitive
              drag and drop functionality. Create the perfect CV builder layout
              that highlights your strengths.
            </p>
          </div>

          {/* Feature 3: AI Suggestions */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-blue-600">
              <HiSparkles size={48} />
            </div>
            <h3 className="font-bold text-lg mb-3">AI Resume Suggestions</h3>
            <p className="text-gray-600 text-sm text-justify">
              Get intelligent suggestions for your resume descriptions powered
              by AI. Enhance your professional resume with optimized content
              that stands out to recruiters.
            </p>
          </div>

          {/* Feature 4: History of Resumes */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-blue-600">
              <FaHistory size={48} />
            </div>
            <h3 className="font-bold text-lg mb-3">Resume Version Control</h3>
            <p className="text-gray-600 text-sm text-justify">
              Maintain a complete history of your resume management with version
              control. Save and access up to four different resume versions for
              different job applications.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-xl mx-auto px-8 py-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-gray-600">
          <span>Made with ❤️ by Dhairya Varshney</span>
          <a
            href="https://github.com/dvbuiilds/resume-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-900 transition-colors"
            aria-label="GitHub Repository"
          >
            <FaGithub size={20} />
          </a>
        </div>
      </footer>
    </>
  );
};

export default Home;
