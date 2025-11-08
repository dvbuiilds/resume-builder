'use client';
import React, { ChangeEvent, useState } from 'react';
import pdfToText from 'react-pdftotext';

export default function Home() {
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    setSelectedFile(file || null);
    if (file) {
      setLoading(true);
      pdfToText(file)
        .then((text) => {
          setExtractedText(text);
        })
        .catch((error) => {
          console.error('Failed to extract text from PDF:', error);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleCreateResume = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Text extraction result is already handled in pdf upload
      // Here you could trigger resume creation logic instead
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-center text-4xl font-bold mb-2">Resume Builder</h1>
      <p className="text-center text-gray-600 mb-10">
        Build a standout resume in minutes by uploading your latest CV PDF or
        your LinkedIn profile.
      </p>
      <div className="flex flex-col sm:flex-row gap-10 justify-center mb-10">
        <div className="flex-1 min-w-[300px] md:min-w-[340px] max-w-lg bg-gray-100 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg mb-4">Upload your Resume PDF:</h2>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block text-sm text-gray-800 file:py-2 file:px-4 file:border-0 file:text-sm file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer file:mr-4"
          />
        </div>
        <div className="flex-1 min-w-[300px] md:min-w-[340px] max-w-lg bg-gray-100 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg mb-4">or Enter LinkedIn profile:</h2>
          <input
            type="text"
            placeholder="LinkedIn Profile URL"
            className="w-full p-2 rounded border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed"
            disabled={true}
          />
          <div className="text-xs text-gray-400 mt-1">Coming Soon</div>
        </div>
      </div>
      <button
        onClick={handleCreateResume}
        className="w-full py-4 bg-blue-600 text-white text-xl font-semibold rounded-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 flex justify-center items-center gap-3 mb-6"
        disabled={loading || !selectedFile}
      >
        {loading ? (
          <span className="inline-flex items-center gap-3">
            <span className="animate-spin w-6 h-6 border-4 border-white border-t-blue-600 rounded-full inline-block"></span>
            Creating Resume...
          </span>
        ) : (
          'Create New Resume'
        )}
      </button>
      {extractedText && !loading ? (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Extracted Text:</h3>
          <pre className="bg-gray-200 rounded p-4 whitespace-pre-wrap max-h-[300px] overflow-y-auto text-xs sm:text-sm">
            {extractedText}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
