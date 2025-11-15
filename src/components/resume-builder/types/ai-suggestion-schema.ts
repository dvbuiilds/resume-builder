import { z } from 'zod';

export const aiSuggestionResponseSchema = z.array(z.string()).length(3);

export const validateAISuggestionResponse = (
  data: unknown,
): string[] | null => {
  const result = aiSuggestionResponseSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
};
