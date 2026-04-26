import Groq from 'groq-sdk';

export class GroqTimeoutError extends Error {
  constructor(ms: number) {
    super(`Groq request timed out after ${Math.round(ms / 1000)} seconds`);
    this.name = 'GroqTimeoutError';
  }
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const getNewChatCompletionWithGroq = async (data: string) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `string is : ${data}`,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.3,
    max_completion_tokens: 2048,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' },
    stop: null,
  });

  const content = chatCompletion.choices?.[0]?.message?.content ?? '';
  return content;
};

export const getDescriptionSuggestionsWithGroq = async (
  input: string,
  jobRole?: string,
  companyName?: string,
): Promise<string[]> => {
  let contextInfo = '';
  if (jobRole || companyName) {
    const parts: string[] = [];
    if (jobRole) parts.push(`Role: ${jobRole}`);
    if (companyName) parts.push(`Org: ${companyName}`);
    contextInfo = `\n${parts.join('\n')}`;
  }

  const userPrompt = `Create 3 concise, action-led resume bullet variants.
Text: ${JSON.stringify(input)}${contextInfo}
Return JSON only: {"suggestions":["","",""]}`;

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: DESCRIPTION_SUGGESTION_SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_completion_tokens: 512,
    top_p: 1,
    stream: false,
    response_format: { type: 'json_object' },
    stop: null,
  });

  const content = chatCompletion.choices?.[0]?.message?.content ?? '';

  // Try to parse JSON from response (object with "suggestions" or legacy array)
  try {
    // Remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent) as unknown;
    const toThreeStringArray = (v: unknown): string[] | null => {
      if (!Array.isArray(v) || v.length !== 3) {
        return null;
      }
      const out = v.map((s) => String(s).trim()).filter(Boolean);
      return out.length === 3 ? out : null;
    };
    if (typeof parsed === 'object' && parsed !== null) {
      const fromKey = toThreeStringArray(
        (parsed as { suggestions?: unknown }).suggestions,
      );
      if (fromKey) {
        return fromKey;
      }
    }
    const fromRoot = toThreeStringArray(parsed);
    if (fromRoot) {
      return fromRoot;
    }
  } catch (err) {
    // If parsing fails, try to extract sentences from text
    console.warn('Failed to parse JSON from Groq response:', err);
  }

  // Fallback: try to extract 3 sentences from plain text
  const sentences = content
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10)
    .slice(0, 3);

  if (sentences.length === 3) {
    return sentences;
  }

  // Last resort: return error message
  throw new Error('Failed to generate 3 valid suggestions from AI response');
};

const SYSTEM_PROMPT = `Convert resume text into one JSON object only. Do not include markdown or explanation.

Use this exact top-level shape:
{
  "title": "",
  "socialHandles": [{ "label": "", "link": "" }],
  "workExperience": { "title": "", "experience": [{ "companyName": "", "jobTitle": "", "startDate": "", "endDate": "", "description": [] }] },
  "projects": { "title": "", "projects": [{ "organizationName": "", "projectTitle": "", "startDate": "", "endDate": "", "description": [] }] },
  "education": { "title": "", "courses": [{ "courseName": "", "institutionName": "", "startDate": "", "endDate": "", "scoreEarned": "", "description": "" }] },
  "activities": { "title": "", "activities": [{ "activityTitle": "", "institutionName": "", "startDate": "", "endDate": "", "descriptions": [] }] },
  "skills": { "title": "", "skillSet": [{ "title": "", "skills": [] }] },
  "achievements": { "title": "", "achievementList": [{ "awardName": "", "institutionName": "", "dateAwarded": "", "description": "" }] }
}

Rules:
- Fill missing scalar fields with "" and missing arrays with [].
- Split bullet lists or "|" separated descriptions into arrays.
- Group repeated jobs, projects, education, activities, skills, and achievements into their arrays.
- Use mailto:email@example.com for email links.
- Preserve dates as written.`;

const DESCRIPTION_SUGGESTION_SYSTEM_PROMPT =
  'Return JSON only. Write exactly 3 concise, achievement-focused resume sentences as {"suggestions":[string,string,string]}.';
