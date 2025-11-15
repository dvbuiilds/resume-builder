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
    model: 'openai/gpt-oss-20b',
    temperature: 1,
    max_completion_tokens: 8192,
    top_p: 1,
    stream: false,
    reasoning_effort: 'medium',
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
    if (jobRole) parts.push(`Job Role: ${jobRole}`);
    if (companyName) parts.push(`Company/Organization: ${companyName}`);
    contextInfo = `\n\nContext:\n${parts.join('\n')}`;
  }

  const userPrompt = `Generate 3 professional resume description sentences based on the following description text: "${input}"${contextInfo}\n\nRequirements:\n- Each sentence should be concise, action-oriented, and professional\n- Use strong action verbs\n- Highlight achievements, impact, or responsibilities\n- Each sentence should be distinct and add value\n- Return ONLY a JSON array of exactly 3 strings, no additional text or explanation\n\nExample format: ["First professional sentence.", "Second professional sentence.", "Third professional sentence."]`;

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
    model: 'openai/gpt-oss-20b',
    temperature: 0.7,
    max_completion_tokens: 512,
    top_p: 1,
    stream: false,
    reasoning_effort: 'medium',
    stop: null,
  });

  const content = chatCompletion.choices?.[0]?.message?.content ?? '';

  // Try to parse JSON array from response
  try {
    // Remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent);
    if (Array.isArray(parsed) && parsed.length === 3) {
      return parsed.map((s) => String(s).trim()).filter(Boolean);
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

const SYSTEM_PROMPT =
  'You are a JSON transformer assistant. Your task is to convert an unstructured input string about a resume into a strictly typed JSON object matching this schema:\n\n```typescript\ninterface ResumeState {\n  title: string;\n  socialHandles: SocialHandle[];\n  workExperience: WorkExperience;\n  projects: Projects;\n  education: Education;\n  activities: Activities;\n  skills: Skills;\n  achievements: Achievements;\n}\n\ninterface SocialHandle {\n  label: string;\n  link: string;\n}\n\ninterface Experience {\n  companyName: string;\n  jobTitle: string;\n  startDate: string;\n  endDate: string;\n  description: string[];\n}\n\ninterface WorkExperience {\n  title: string;\n  experience: Experience[];\n}\n\ninterface Project {\n  organizationName: string;\n  projectTitle: string;\n  startDate: string;\n  endDate: string;\n  description: string[];\n}\n\ninterface Projects {\n  title: string;\n  projects: Project[];\n}\n\ninterface Course {\n  courseName: string;\n  institutionName: string;\n  startDate: string;\n  endDate: string;\n  scoreEarned: string;\n  description: string;\n}\n\ninterface Education {\n  title: string;\n  courses: Course[];\n}\n\ninterface ActivityItem {\n  activityTitle: string;\n  institutionName: string;\n  startDate: string;\n  endDate: string;\n  descriptions: string[];\n}\n\ninterface Activities {\n  title: string;\n  activities: ActivityItem[];\n}\n\ninterface SkillSetItem {\n  title: string;\n  skills: string[];\n}\n\ninterface Skills {\n  title: string;\n  skillSet: SkillSetItem[];\n}\n\ninterface AchievementItem {\n  awardName: string;\n  institutionName: string;\n  dateAwarded: string;\n  description: string;\n}\n\ninterface Achievements {\n  title: string;\n  achievementList: AchievementItem[];\n}\n```\n\nInstructions:\n\nExtract all relevant data from the text input according to the above schema.\n\nDescriptions or descriptions-like fields that contain multiple items separated by a special character (use |) in the input must be split into arrays.\n\nGroup all related entries (e.g., multiple work experiences, social handles) into their respective arrays.\n\nEnsure email social handles have their link field use mailto:emailaddress format.\n\nReturn the final JSON object strictly matching the ResumeState interface, with all nested arrays and fields properly filled.\n\nInput format:\n\nYou will receive a plain text string describing the resume content in any order.\n\nExpected output:\n\nA JSON object with keys, types, and nested arrays as per the ResumeState interface.\n\nEnd of instructions';

const DESCRIPTION_SUGGESTION_SYSTEM_PROMPT =
  'You are a professional resume writing assistant. Your task is to generate concise, impactful resume description sentences that highlight achievements, responsibilities, and impact. Always return exactly 3 professional sentences in a JSON array format.';
