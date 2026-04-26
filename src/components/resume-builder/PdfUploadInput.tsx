'use client';

import React, { ChangeEvent } from 'react';
import pdfToText from 'react-pdftotext';

export interface PdfExtractResult {
  file: File;
  text: string;
  dataUrl: string;
}

interface Props {
  isAuthenticated: boolean;
  onExtracting: (loading: boolean) => void;
  onExtracted: (result: PdfExtractResult) => void;
  onCleared: () => void;
  onError: (message: string) => void;
  onFileSelected: (file: File | null) => void;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to read file as data URL.'));
    reader.readAsDataURL(file);
  });

export const PdfUploadInput: React.FC<Props> = ({
  onExtracting,
  onExtracted,
  onCleared,
  onError,
  onFileSelected,
}) => {
  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0] ?? null;
    onFileSelected(file);

    if (!file) {
      onCleared();
      return;
    }

    onExtracting(true);
    try {
      const [text, dataUrl] = await Promise.all([
        pdfToText(file),
        readFileAsDataUrl(file),
      ]);
      onExtracted({ file, text, dataUrl });
    } catch (err) {
      console.error('Failed to extract text from PDF:', err);
      onError('We could not read this PDF file. Please try another file or try again.');
    } finally {
      onExtracting(false);
    }
  };

  return (
    <input
      type="file"
      accept="application/pdf"
      onChange={handleChange}
      className="block text-sm text-gray-800 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer file:mr-4"
    />
  );
};
