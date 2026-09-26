import { GoogleGenAI, Type } from '@google/genai';
import type { AiTaskSuggestion } from '../types/task.types.js';

function formatFallback(prompt: string): AiTaskSuggestion {
  const clean = prompt.trim();
  // Capitalize first letter of each sentence or word
  const title = clean.charAt(0).toUpperCase() + clean.slice(1);
  return {
    title: title.slice(0, 100),
    description: `Action item: ${clean}`,
  };
}

export async function generateTaskFromPrompt(prompt: string): Promise<AiTaskSuggestion> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key configured, use intelligent local fallback
  if (!apiKey) {
    console.warn('[AI Service] GEMINI_API_KEY not configured. Using local fallback.');
    return formatFallback(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an executive productivity assistant.
The user enters a brief or natural language task note.
Your job is to transform it into:
1. "title": A concise, clear, professional title (under 10 words, Title Case).
2. "description": A single actionable sentence expanding on what needs to be done. Keep it grounded only in what was stated or directly implied. Do NOT invent unrelated tasks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Clear, professional task title',
            },
            description: {
              type: Type.STRING,
              description: 'Actionable, single-sentence task description',
            },
          },
          required: ['title', 'description'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return formatFallback(prompt);
    }

    const parsed = JSON.parse(text) as { title?: string; description?: string };
    if (!parsed.title || typeof parsed.title !== 'string') {
      return formatFallback(prompt);
    }

    return {
      title: parsed.title.trim().slice(0, 255),
      description: (parsed.description || '').trim().slice(0, 2000),
    };
  } catch (error) {
    console.error('[AI Service Error]:', error instanceof Error ? error.message : error);
    // Graceful fallback to avoid blocking the user
    return formatFallback(prompt);
  }
}
