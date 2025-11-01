
import React, { useState } from 'react';
import type { StoryInputs } from '../types';

interface StoryFormProps {
  onSubmit: (inputs: StoryInputs) => void;
  onReset: () => void;
  isGenerating: boolean;
  showReset: boolean;
}

const Button: React.FC<{ onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean; className?: string; children: React.ReactNode }> = ({ onClick, disabled, className, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${className} ${disabled ? 'bg-gray-600 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);


export const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isGenerating, onReset, showReset }) => {
  const [characters, setCharacters] = useState('Um detetive cético chamado Alex e uma médium enigmática chamada Luna.');
  const [style, setStyle] = useState('Mistério noir com elementos sobrenaturais, ambientado em uma chuvosa cidade dos anos 1940.');
  const [pageCount, setPageCount] = useState(100);
  const [chapterCount, setChapterCount] = useState(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ characters, style, pageCount, chapterCount });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl sticky top-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="characters" className="block text-sm font-medium text-indigo-300">
            Personagens
          </label>
          <div className="mt-1">
            <textarea
              id="characters"
              name="characters"
              rows={4}
              className="block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200 placeholder-gray-500"
              placeholder="Ex: Um cavaleiro caído em busca de redenção e uma princesa rebelde..."
              value={characters}
              onChange={(e) => setCharacters(e.target.value)}
              required
              disabled={isGenerating}
            />
          </div>
        </div>
        <div>
          <label htmlFor="style" className="block text-sm font-medium text-indigo-300">
            Estilo / Gênero
          </label>
          <div className="mt-1">
            <textarea
              id="style"
              name="style"
              rows={4}
              className="block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200 placeholder-gray-500"
              placeholder="Ex: Fantasia épica com um sistema de magia complexo..."
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              required
              disabled={isGenerating}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="pageCount" className="block text-sm font-medium text-indigo-300">
                Páginas (1-200)
                </label>
                <div className="mt-1">
                <input
                    id="pageCount"
                    name="pageCount"
                    type="number"
                    min="1"
                    max="200"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, Math.min(200, parseInt(e.target.value, 10) || 1)))}
                    className="block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
                    required
                    disabled={isGenerating}
                />
                </div>
            </div>
            <div>
                <label htmlFor="chapterCount" className="block text-sm font-medium text-indigo-300">
                Capítulos
                </label>
                <div className="mt-1">
                <input
                    id="chapterCount"
                    name="chapterCount"
                    type="number"
                    min="1"
                    max="100"
                    value={chapterCount}
                    onChange={(e) => setChapterCount(Math.max(1, Math.min(100, parseInt(e.target.value, 10) || 1)))}
                    className="block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-200"
                    required
                    disabled={isGenerating}
                />
                </div>
            </div>
        </div>


        <div className="pt-2 space-y-4">
            {!showReset ? (
                <Button onClick={handleSubmit} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700">
                    {isGenerating ? (
                        <>
                            <Spinner />
                            Tecendo sua história...
                        </>
                    ) : (
                        'Enviar'
                    )}
                </Button>
            ) : (
                <Button onClick={onReset} className="bg-red-600 hover:bg-red-700">
                    {isGenerating ? 'Cancelar' : 'Começar Nova História'}
                </Button>
            )}
        </div>
      </form>
    </div>
  );
};

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
