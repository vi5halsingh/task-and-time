import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import type { AiTaskSuggestion } from '../types/task.types.js';

function formatFallback(prompt: string): AiTaskSuggestion {
  const clean = prompt.trim();
  const title = clean.charAt(0).toUpperCase() + clean.slice(1);
  return {
    title: title.slice(0, 100),
    description: `Action item: ${clean}`,
  };
}

export async function generateTaskFromPrompt(prompt: string): Promise<AiTaskSuggestion> {
  // Always refresh environment variables in case .env was modified after server boot
  dotenv.config();
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  // If no API key configured, use local fallback
  if (!apiKey) {
    console.warn('[AI Service] GEMINI_API_KEY not configured. Using local fallback.');
    return formatFallback(prompt);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a helpful executive productivity assistant.
The user enters a brief or natural language task note.
Your job is to transform it into:
1. "title": A clear, professional, concise Title Case task title. Correct any typos (e.g. "prepration" -> "Preparation").
2. "description": A structured, actionable description expanding on the key steps or objective for this task.

Example 1:
Input: "follow up with designer"
Output:
{
  "title": "Follow up with UI Designer",
  "description": "Send a Slack message to confirm wireframe delivery status."
}

Example 2:
Input: "interview prepration"
Output:
{
  "title": "Interview Preparation",
  "description": "Review core technical concepts, practice coding problems, and prepare behavioral responses."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Task prompt: "${prompt}"`,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Clear, professional, Title Case task title',
            },
            description: {
              type: Type.STRING,
              description: 'Actionable, structured task description',
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
    return formatFallback(prompt);
  }
}
