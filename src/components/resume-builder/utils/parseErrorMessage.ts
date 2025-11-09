export const parseErrorMessage = async (
  response: Response,
): Promise<string> => {
  try {
    const payload = await response.json();
    const candidate = payload?.error ?? payload?.message;
    if (candidate && typeof candidate === 'string') {
      return candidate;
    }
  } catch {
    // fall through to default response text
  }

  return response.statusText || 'Unexpected error';
};
