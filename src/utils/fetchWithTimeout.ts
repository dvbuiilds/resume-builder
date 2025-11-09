const DEFAULT_TIMEOUT_MS = 10_000;

const createTimeoutError = (timeoutMs: number): Error => {
  const error = new Error(`Request timed out after ${timeoutMs}ms`);
  error.name = 'TimeoutError';
  return error;
};

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutError = createTimeoutError(timeoutMs);

  const timeoutId = setTimeout(() => {
    controller.abort(timeoutError);
  }, timeoutMs);

  const userSignal = init?.signal;
  if (userSignal) {
    if (userSignal.aborted) {
      clearTimeout(timeoutId);
      controller.abort(userSignal.reason);
    } else {
      userSignal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeoutId);
          controller.abort(userSignal.reason);
        },
        { once: true },
      );
    }
  }

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export { fetchWithTimeout };
export default fetchWithTimeout;
