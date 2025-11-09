import { GroqTimeoutError } from '@resume-builder/llms/groq/groq';

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorFactory: (ms: number) => Error = (ms) => new GroqTimeoutError(ms),
): Promise<T> => {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(errorFactory(timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId!);
  }
};
