
import React from 'react';
import type { GeneratedChapter } from '../types';
import { GenerationState } from '../types';

interface StoryDisplayProps {
  state: GenerationState;
  statusMessage: string;
  error: string | null;
  story: GeneratedChapter[];
  totalChapters: number;
  isEditing: boolean;
  editableStory: string;
  onToggleEdit: () => void;
  onStoryChange: (content: string) => void;
  onSave: () => void;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center text-center p-8">
    <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-lg font-semibold text-gray-300">{message}</p>
  </div>
);

const WelcomeMessage: React.FC = () => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
        <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">Bem-vindo ao AI Story Weaver</h2>
            <p className="text-lg text-gray-400">
                Sua jornada para criar mundos fantásticos começa aqui. Preencha os detalhes da sua história no painel à esquerda, e a IA tecerá uma narrativa completa para você, capítulo por capítulo.
            </p>
        </div>
    </div>
);

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Oops! </strong>
        <span className="block sm:inline">{error}</span>
    </div>
);

const EditSaveButtons: React.FC<{isEditing: boolean, onToggleEdit: () => void, onSave: () => void}> = ({ isEditing, onToggleEdit, onSave }) => (
    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-gray-800 py-4 z-10">
        <button 
            onClick={onToggleEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
        >
            {isEditing ? 'Visualizar História' : 'Editar'}
        </button>
        <button 
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800"
        >
            Salvar História (.md)
        </button>
    </div>
);

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ 
    state, 
    statusMessage, 
    error, 
    story, 
    totalChapters,
    isEditing,
    editableStory,
    onToggleEdit,
    onStoryChange,
    onSave
 }) => {
  const renderContent = () => {
    switch (state) {
      case GenerationState.Idle:
        return <WelcomeMessage />;
      case GenerationState.GeneratingOutline:
      case GenerationState.GeneratingChapters:
        return (
          <>
            {story.map((chapter) => (
              <div key={chapter.chapter_number} className="mb-8 pb-8 border-b border-gray-700 last:border-b-0">
                <h3 className="text-2xl font-bold text-indigo-400 mb-4">Capítulo {chapter.chapter_number}</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{chapter.content}</p>
              </div>
            ))}
            <LoadingIndicator message={statusMessage} />
          </>
        );
      case GenerationState.Complete:
        return (
            <>
              <EditSaveButtons isEditing={isEditing} onToggleEdit={onToggleEdit} onSave={onSave} />
              {isEditing ? (
                  <textarea
                    value={editableStory}
                    onChange={(e) => onStoryChange(e.target.value)}
                    className="w-full h-[calc(100vh-20rem)] bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 placeholder-gray-500 font-serif text-lg leading-relaxed p-4"
                    aria-label="Editor de história"
                  />
              ) : (
                <>
                  {story.map((chapter) => (
                    <div key={chapter.chapter_number} className="mb-8 pb-8 border-b border-gray-700 last:border-b-0">
                      <h3 className="text-2xl font-bold text-indigo-400 mb-4">Capítulo {chapter.chapter_number}</h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">{chapter.content}</p>
                    </div>
                  ))}
                   <div className="text-center py-8 text-green-400 font-semibold text-xl">
                     <p>{statusMessage}</p>
                   </div>
                </>
              )}
            </>
        );
      case GenerationState.Error:
        return <ErrorMessage error={error!} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-2xl h-[calc(100vh-12rem)] overflow-y-auto">
      {renderContent()}
    </div>
  );
};
