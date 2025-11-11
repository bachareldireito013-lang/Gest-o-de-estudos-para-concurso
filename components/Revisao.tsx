import React, { useState } from 'react';
import { Flashcard } from '../types';
import { BrainCircuit, CheckCircle } from 'lucide-react';

// --- SRS Algorithm Constants ---
// Intervals in milliseconds. ~10min, 1 day, 4 days, 10 days, 25 days, 2.5 months, etc.
const srsIntervals = [
  10 * 60 * 1000,
  24 * 60 * 60 * 1000,
  4 * 24 * 60 * 60 * 1000,
  10 * 24 * 60 * 60 * 1000,
  25 * 24 * 60 * 60 * 1000,
  75 * 24 * 60 * 60 * 1000,
  180 * 24 * 60 * 60 * 1000,
];

// --- Flashcard Reviewer Component ---
interface FlashcardReviewerProps {
  cards: Flashcard[];
  onSessionComplete: () => void;
  updateFlashcard: (card: Flashcard) => void;
}

const FlashcardReviewer: React.FC<FlashcardReviewerProps> = ({ cards, onSessionComplete, updateFlashcard }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);

  if (currentCardIndex >= cards.length) {
    onSessionComplete();
    return null;
  }

  const currentCard = cards[currentCardIndex];

  const handleRating = (rating: 'again' | 'hard' | 'easy') => {
    let nextSrsLevel = currentCard.srsLevel;
    
    switch (rating) {
      case 'again':
        nextSrsLevel = 0; // Reset progress
        break;
      case 'hard':
        // Stay on the same level or go back one, but don't reset completely
        nextSrsLevel = Math.max(0, nextSrsLevel -1);
        break;
      case 'easy':
        nextSrsLevel += 1;
        break;
    }

    const interval = srsIntervals[Math.min(nextSrsLevel, srsIntervals.length - 1)];
    const nextReviewDate = new Date(Date.now() + interval).toISOString();

    updateFlashcard({
      ...currentCard,
      srsLevel: nextSrsLevel,
      nextReviewDate,
    });

    // Move to next card
    setIsAnswerVisible(false);
    setCurrentCardIndex(currentCardIndex + 1);
  };


  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border min-h-[250px] flex flex-col justify-center items-center text-center shadow-lg">
        <div className={`transition-opacity duration-500 ${isAnswerVisible ? 'opacity-50' : 'opacity-100'}`}>
           <p className="text-dark-secondary-text mb-2">FRENTE</p>
           <p className="text-2xl text-dark-text">{currentCard.front}</p>
        </div>
        {isAnswerVisible && <hr className="w-full border-dark-border my-4" />}
        <div className={`transition-opacity duration-500 ${isAnswerVisible ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
           <p className="text-dark-secondary-text mb-2">VERSO</p>
           <p className="text-2xl text-dark-accent font-semibold">{currentCard.back}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {!isAnswerVisible ? (
          <button 
            onClick={() => setIsAnswerVisible(true)}
            className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Mostrar Resposta
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-4 w-full">
            <button 
              onClick={() => handleRating('again')}
              className="bg-error hover:opacity-80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Errei <span className="text-sm block opacity-80">(~10 min)</span>
            </button>
             <button 
              onClick={() => handleRating('hard')}
              className="bg-yellow-500 hover:opacity-80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Difícil <span className="text-sm block opacity-80">(~1 dia)</span>
            </button>
             <button 
              onClick={() => handleRating('easy')}
              className="bg-success hover:opacity-80 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Fácil <span className="text-sm block opacity-80">(+4 dias)</span>
            </button>
          </div>
        )}
      </div>
      <div className="text-center mt-4 text-dark-secondary-text">
        Card {currentCardIndex + 1} de {cards.length}
      </div>
    </div>
  );
};


// --- SRS Dashboard Page Component ---
interface RevisoesPageProps {
  dueCards: Flashcard[];
  updateFlashcard: (card: Flashcard) => void;
}

export const RevisoesPage: React.FC<RevisoesPageProps> = ({ dueCards, updateFlashcard }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  
  if (isReviewing) {
    return <FlashcardReviewer cards={dueCards} onSessionComplete={() => setIsReviewing(false)} updateFlashcard={updateFlashcard} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text mb-4">Revisões Agendadas</h1>
      <div className="bg-dark-card p-8 rounded-lg border border-dark-border text-center shadow-lg">
        {dueCards.length > 0 ? (
          <>
            <BrainCircuit className="mx-auto h-16 w-16 text-dark-accent mb-4" />
            <p className="text-xl text-dark-secondary-text mb-2">Você tem</p>
            <p className="text-6xl font-bold text-dark-text mb-4">{dueCards.length}</p>
            <p className="text-xl text-dark-secondary-text mb-8">{dueCards.length === 1 ? 'card para revisar hoje.' : 'cards para revisar hoje.'}</p>
            <button 
              onClick={() => setIsReviewing(true)}
              className="bg-dark-accent hover:bg-dark-hover text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Iniciar Sessão de Revisão
            </button>
          </>
        ) : (
           <>
            <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
            <h2 className="text-2xl font-bold text-dark-text mb-2">Tudo em dia!</h2>
            <p className="text-dark-secondary-text">
              Você não tem nenhum card para revisar hoje. Ótimo trabalho!
            </p>
          </>
        )}
      </div>
    </div>
  );
};