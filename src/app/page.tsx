'use client';
import React, { ChangeEvent, useState } from 'react';
import pdfToText from 'react-pdftotext';

export default function Home() {
  const [extractedText, setExtractedText] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      pdfToText(file)
        .then((text) => {
          setExtractedText(text);
          console.log('Extracted Text:', text);
        })
        .catch((error) => {
          console.error('Failed to extract text from PDF:', error);
        });
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {extractedText && (
        <div>
          <h3>Extracted Text:</h3>
          <pre>{extractedText}</pre>
        </div>
      )}
    </div>
  );
}
