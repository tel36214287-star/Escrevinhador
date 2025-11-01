
export interface StoryInputs {
  characters: string;
  style: string;
  pageCount: number;
  chapterCount: number;
}

export interface ChapterOutline {
  chapter_number: number;
  chapter_summary: string;
}

export interface GeneratedChapter {
  chapter_number: number;
  content: string;
}

export interface ChapterGenerationContext {
    characters: string;
    style: string;
    chapterSummary: string;
    previousChapters: string;
}

export enum GenerationState {
  Idle,
  GeneratingOutline,
  GeneratingChapters,
  Complete,
  Error,
}
