
import { GoogleGenAI, Type } from "@google/genai";
import type { StoryInputs, ChapterOutline, ChapterGenerationContext } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOutline = async (inputs: StoryInputs, signal: AbortSignal): Promise<ChapterOutline[]> => {
  const { characters, style, pageCount, chapterCount } = inputs;

  const prompt = `
    Create a detailed, chapter-by-chapter story outline for a fictional story.
    The story should be approximately ${pageCount} pages long and must be divided into exactly ${chapterCount} chapters.
    
    Story Details:
    - Characters: ${characters}
    - Style/Genre: ${style}

    Your task is to generate a JSON array of objects, where each object represents a chapter.
    The array must contain exactly ${chapterCount} elements.
    Each object must have two keys: "chapter_number" (an integer, starting from 1) and "chapter_summary" (a string).
    The summary should be a concise but descriptive paragraph outlining the key events, character developments, and plot points of that chapter.
    The summaries must logically flow from one chapter to the next, building a coherent narrative.
  `;
  
  // FIX: Removed `signal` property from `generateContent` parameters as it is not supported.
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    chapter_number: {
                        type: Type.INTEGER,
                        description: "The sequential number of the chapter."
                    },
                    chapter_summary: {
                        type: Type.STRING,
                        description: "A detailed summary of the plot points and events in this chapter."
                    }
                },
                required: ["chapter_number", "chapter_summary"],
            }
          }
      }
  });

  try {
    const jsonText = response.text.trim();
    const outline = JSON.parse(jsonText);
    return outline as ChapterOutline[];
  } catch (e) {
    console.error("Failed to parse JSON outline:", response.text);
    throw new Error("The AI returned an invalid story outline. Please try adjusting your inputs.");
  }
};


export const generateChapter = async (context: ChapterGenerationContext, signal: AbortSignal): Promise<string> => {
    const { characters, style, chapterSummary, previousChapters } = context;

    const prompt = `
        You are a master storyteller, writing a chapter for a novel in the '${style}' genre.
        
        Overall Story Context:
        - Main Characters: ${characters}
        
        Summary of Previous Chapters (for context):
        ${previousChapters || "This is the first chapter."}

        Your Current Task:
        Write a complete and engaging chapter based on the following summary.
        - Chapter Summary: ${chapterSummary}

        Instructions:
        - Write in a compelling and professional style.
        - Show, don't just tell. Use vivid descriptions and dialogue.
        - Ensure the chapter flows naturally and ends in a way that makes the reader want to continue.
        - Do not include "Chapter X" or any titles. Just write the body of the chapter.
        - The output should be several paragraphs long.
    `;

    // FIX: Removed `signal` property from `generateContent` parameters as it is not supported.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};
