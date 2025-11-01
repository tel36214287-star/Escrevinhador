
import React, { useState, useCallback, useRef } from 'react';
import { StoryForm } from './components/StoryForm';
import { StoryDisplay } from './components/StoryDisplay';
import { Header } from './components/Header';
import { generateOutline, generateChapter } from './services/geminiService';
import type { StoryInputs, ChapterOutline, GeneratedChapter, ChapterGenerationContext } from './types';
import { GenerationState } from './types';

const App: React.FC = () => {
  const [storyInputs, setStoryInputs] = useState<StoryInputs>({
    characters: '',
    style: '',
    pageCount: 100,
    chapterCount: 20,
  });
  const [generationState, setGenerationState] = useState<GenerationState>(GenerationState.Idle);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<ChapterOutline[]>([]);
  const [generatedStory, setGeneratedStory] = useState<GeneratedChapter[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editableStory, setEditableStory] = useState('');
  const isGeneratingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const formatStoryToString = (story: GeneratedChapter[]): string => {
    return story
      .map(chapter => `## Capítulo ${chapter.chapter_number}\n\n${chapter.content}`)
      .join('\n\n---\n\n');
  };

  const handleReset = () => {
    if (isGeneratingRef.current && abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    setGenerationState(GenerationState.Idle);
    setStatusMessage('');
    setError(null);
    setOutline([]);
    setGeneratedStory([]);
    isGeneratingRef.current = false;
    setIsEditing(false);
    setEditableStory('');
  };

  const handleGenerateStory = useCallback(async (inputs: StoryInputs) => {
    if (isGeneratingRef.current) return;

    handleReset();
    isGeneratingRef.current = true;
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setStoryInputs(inputs);
    setGenerationState(GenerationState.GeneratingOutline);
    setStatusMessage('Crafting a compelling story outline...');

    try {
      const chapterOutline = await generateOutline(inputs, signal);
      if (signal.aborted) return;

      setOutline(chapterOutline);
      setGenerationState(GenerationState.GeneratingChapters);

      const newGeneratedStory: GeneratedChapter[] = [];
      for (const chapter of chapterOutline) {
        if (signal.aborted) {
          console.log('Chapter generation aborted.');
          break;
        }
        setStatusMessage(`Writing Chapter ${chapter.chapter_number} of ${chapterOutline.length}...`);
        
        const chapterContext: ChapterGenerationContext = {
          characters: inputs.characters,
          style: inputs.style,
          chapterSummary: chapter.chapter_summary,
          previousChapters: newGeneratedStory.map(c => `Chapter ${c.chapter_number}: ${c.content.substring(0, 200)}...`).join('\n'),
        };

        const chapterContent = await generateChapter(chapterContext, signal);
        if (signal.aborted) break;
        
        const newChapter = { chapter_number: chapter.chapter_number, content: chapterContent };
        newGeneratedStory.push(newChapter);
        setGeneratedStory([...newGeneratedStory]);
      }
      
      if (!signal.aborted) {
        setGenerationState(GenerationState.Complete);
        setStatusMessage('Your story is complete!');
      } else {
        handleReset();
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generation was aborted by user.');
        handleReset();
      } else {
        console.error(err);
        setError('An unexpected error occurred while weaving your story. Please try again.');
        setGenerationState(GenerationState.Error);
      }
    } finally {
        if (!signal.aborted) {
            isGeneratingRef.current = false;
        }
    }
  }, []);

  const handleToggleEdit = () => {
    if (!isEditing) {
      setEditableStory(formatStoryToString(generatedStory));
    }
    setIsEditing(!isEditing);
  };
  
  const handleStoryEdit = (content: string) => {
    setEditableStory(content);
  };

  const handleSave = () => {
    const contentToSave = isEditing ? editableStory : formatStoryToString(generatedStory);
    const blob = new Blob([contentToSave], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = storyInputs.style.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'historia';
    link.download = `${filename}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <StoryForm
              onSubmit={handleGenerateStory}
              isGenerating={generationState !== GenerationState.Idle && generationState !== GenerationState.Complete && generationState !== GenerationState.Error}
              onReset={handleReset}
              showReset={generationState !== GenerationState.Idle}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            <StoryDisplay
              state={generationState}
              statusMessage={statusMessage}
              error={error}
              story={generatedStory}
              totalChapters={outline.length}
              isEditing={isEditing}
              editableStory={editableStory}
              onToggleEdit={handleToggleEdit}
              onStoryChange={handleStoryEdit}
              onSave={handleSave}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
