import { useState, useEffect, useRef } from 'react';
import type { Flashcard } from '../../../shared/types';
import { ChevronLeft, ChevronRight, RotateCw, Check, Loader2 } from 'lucide-react';
import { GameHeader } from './GameHeader';
import { cn } from '../../../shared/lib/utils';

interface FlashCardGameProps {
    cards: Flashcard[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
    isSubmitting?: boolean;
    onExit?: () => void;
    onShare?: () => void;
    onAssign?: () => void;
}

export const FlashCardGame = ({
    cards,
    onGameComplete,
    isSubmitting,
    onExit,
    onShare,
    onAssign
}: FlashCardGameProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [viewedCards, setViewedCards] = useState<Set<number>>(new Set());
    const startTimeRef = useRef<number | null>(null);
    const [completed, setCompleted] = useState(false);

    const handleExit = () => {
        if (onExit) {
            onExit();
        } else {
            window.history.back();
        }
    };

    useEffect(() => {
        startTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        if (isFlipped && !viewedCards.has(currentIndex)) {
            setViewedCards((prev) => new Set([...prev, currentIndex]));
        }
    }, [isFlipped, currentIndex]);

    const handleComplete = () => {
        if (viewedCards.size === cards.length && !completed && startTimeRef.current) {
            setCompleted(true);
            const timeInSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
            if (onGameComplete) {
                onGameComplete(viewedCards.size, timeInSeconds);
            }
        }
    };

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

    if (completed) {
        return (
            <div className="flex items-center justify-center min-h-[400px] p-4 w-full">
                <div className="glass-panel max-w-md w-full p-8 text-center animate-scale-in">
                    <div className="size-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-4xl">task_alt</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Completed!</h2>
                    <p className="text-slate-500 mb-8">
                        You have reviewed all the cards in this session.
                    </p>

                    <div className="flex flex-col gap-3">
                        {!onGameComplete && (
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setViewedCards(new Set());
                                    setCompleted(false);
                                    setIsFlipped(false);
                                    startTimeRef.current = Date.now();
                                }}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl h-16 px-10 bg-primary hover:bg-primary-dark text-white text-xl font-black leading-normal tracking-wide shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] transition-all active:scale-95 group"
                            >
                                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span>
                                <span>Review Again</span>
                            </button>
                        )}
                        <button
                            onClick={handleExit}
                            className="flex items-center justify-center gap-3 w-full h-14 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111318] dark:text-white rounded-2xl font-bold transition-all"
                        >
                            <span className="material-symbols-outlined">home</span> Back to Hub
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1024px] mx-auto text-center w-full flex flex-col gap-4 p-4">
            <GameHeader
                title="Flashcard Review"
                onShare={onShare}
                onExit={handleExit}
            >
                {onAssign && (
                    <button
                        onClick={onAssign}
                        className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-lg transition-colors text-sm font-bold"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        <span className="hidden sm:inline">Assign</span>
                    </button>
                )}
            </GameHeader>

            <div className="w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-slate-500 font-bold mb-2 uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{viewedCards.size} / {cards.length} cards viewed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="w-full h-full bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 rounded-3xl min-h-[400px] flex flex-col justify-center items-center cursor-pointer mb-8 relative shadow-xl border border-gray-200 dark:border-gray-700 group overflow-hidden"
                    onClick={handleFlip}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-primary"></div>

                    <div className={cn(
                        "flex flex-col items-center justify-center gap-6 w-full h-full p-8 transition-all duration-500 transform",
                    )}>
                        {!isFlipped && currentCard.imageUrl && (
                            <div className="w-full max-w-[240px] aspect-video rounded-xl overflow-hidden shadow-lg border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <img
                                    src={currentCard.imageUrl}
                                    alt="Flashcard"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white text-center">
                            {isFlipped ? currentCard.back : currentCard.front}
                        </div>
                    </div>

                    <div className="mt-8 text-slate-400 text-sm font-bold flex items-center gap-2 uppercase tracking-widest">
                        <RotateCw size={18} />
                        Tap to flip
                    </div>

                    {/* Viewed indicator */}
                    {viewedCards.has(currentIndex) && (
                        <div className="absolute top-6 right-6 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg shadow-green-500/20">
                            <Check size={16} /> VIEWED
                        </div>
                    )}
                </div>

                {/* Finish Button */}
                {viewedCards.size === cards.length && !completed && (
                    <div className="mb-8 animate-bounce">
                        <button
                            onClick={handleComplete}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg shadow-green-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Check size={24} /> FINISH SESSION
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <button
                        onClick={handlePrev}
                        className="flex items-center gap-2 px-3 sm:px-6 py-3 font-bold text-slate-600 dark:text-gray-300 hover:text-primary transition-colors disabled:opacity-30"
                        disabled={cards.length <= 1}
                    >
                        <ChevronLeft size={24} />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                            {currentIndex + 1}
                        </span>
                        <span className="text-slate-400 font-bold">/</span>
                        <span className="text-slate-400 font-bold">
                            {cards.length}
                        </span>
                    </div>

                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-3 sm:px-6 py-3 font-bold text-slate-600 dark:text-gray-300 hover:text-primary transition-colors disabled:opacity-30"
                        disabled={cards.length <= 1}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
            {isSubmitting && (
                <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-bold">Saving results...</h3>
                    </div>
                </div>
            )}
        </div>
    );
};
