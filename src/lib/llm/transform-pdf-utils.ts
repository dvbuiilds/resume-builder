import {
  ResumeOutput,
  sanitizeResumeOutput,
} from '@resume-builder/components/resume-builder/types/pdf-transform-schema';

export const extractJsonString = (raw: string): string | null => {
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return raw.trim() ? raw : null;
};

export const parseResumeOutput = (raw: string): ResumeOutput | null => {
  const jsonString = extractJsonString(raw);
  if (!jsonString) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return sanitizeResumeOutput(parsed);
  } catch {
    return null;
  }
};
