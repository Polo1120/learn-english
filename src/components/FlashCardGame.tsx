import { useState, useEffect } from 'react';
import type { Flashcard } from '../types';
import { ChevronLeft, ChevronRight, RotateCw, Check } from 'lucide-react';

interface FlashCardGameProps {
    cards: Flashcard[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
}

export const FlashCardGame = ({ cards, onGameComplete }: FlashCardGameProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
    const [startTime] = useState(Date.now());
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        // Mark current card as viewed when flipped
        if (isFlipped && !viewedCards.has(currentIndex)) {
            setViewedCards(new Set([...viewedCards, currentIndex]));
        }
    }, [isFlipped, currentIndex]);

    useEffect(() => {
        // Check if all cards have been viewed
        if (viewedCards.size === cards.length && !completed && onGameComplete) {
            setCompleted(true);
            const timeInSeconds = Math.floor((Date.now() - startTime) / 1000);
            // Score is based on cards viewed
            onGameComplete(viewedCards.size, timeInSeconds);
        }
    }, [viewedCards, cards.length, completed, onGameComplete, startTime]);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const currentCard = cards[currentIndex];
    const progress = (viewedCards.size / cards.length) * 100;

    return (
        <div className="max-w-2xl mx-auto text-center">
            {/* Progress Bar */}
            {onGameComplete && (
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>{viewedCards.size} / {cards.length} cards viewed</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            <div
                className="card min-h-[300px] flex flex-col justify-center items-center cursor-pointer mb-8 relative"
                onClick={handleFlip}
            >
                <div className="text-4xl font-bold text-slate-900 transition-transform duration-600">
                    {isFlipped ? currentCard.back : currentCard.front}
                </div>
                <div className="mt-4 text-slate-500 text-sm flex items-center gap-2">
                    <RotateCw size={16} /> Click to flip
                </div>

                {/* Viewed indicator */}
                {viewedCards.has(currentIndex) && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Check size={14} /> Viewed
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={handlePrev}
                    className="btn btn-outline"
                    disabled={cards.length <= 1}
                >
                    <ChevronLeft size={20} /> Previous
                </button>
                <span className="text-slate-500 font-medium">
                    {currentIndex + 1} / {cards.length}
                </span>
                <button
                    onClick={handleNext}
                    className="btn btn-outline"
                    disabled={cards.length <= 1}
                >
                    Next <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
