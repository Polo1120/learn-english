import { useState, useEffect, useRef } from 'react';
import { cn } from '../../../shared/lib/utils';
import type { WordGuess } from '../../../shared/types';
import { ArrowRight, Loader2, Image as ImageIcon, Zap, AlertTriangle, Timer, Trophy } from 'lucide-react';
import { GameHeader } from './GameHeader';

interface WordImageGameProps {
    words: WordGuess[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
    onShare?: () => void;
    onExit?: () => void;
    onAssign?: () => void;
    isSubmitting?: boolean;
}

export const WordImageGame = ({ words, onGameComplete, onShare, onAssign, isSubmitting, onExit }: WordImageGameProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [score, setScore] = useState(0);
    const startTimeRef = useRef<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showScore, setShowScore] = useState(false);

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
        const interval = setInterval(() => {
            if (gameStatus === 'playing' && startTimeRef.current) {
                setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [gameStatus]);

    useEffect(() => {
        setGuessedLetters([]);
        setWrongGuesses(0);
        setGameStatus('playing');
    }, [currentIndex]);

    const currentWordObj = words[currentIndex];
    const wordToGuess = currentWordObj.word.toUpperCase();
    const maxWrongGuesses = 6;
    const livesRemaining = Math.max(0, maxWrongGuesses - wrongGuesses);

    const handleGuess = (letter: string) => {
        if (gameStatus !== 'playing' || guessedLetters.includes(letter)) return;

        setGuessedLetters([...guessedLetters, letter]);

        if (!wordToGuess.includes(letter)) {
            const newWrongGuesses = wrongGuesses + 1;
            setWrongGuesses(newWrongGuesses);
            if (newWrongGuesses >= maxWrongGuesses) {
                setGameStatus('lost');
            }
        } else {
            const isWordComplete = wordToGuess.split('').every((char: string) =>
                char === ' ' || [...guessedLetters, letter].includes(char)
            );
            if (isWordComplete) {
                setGameStatus('won');
                setScore(score + 10);
            }
        }
    };

    const handleNextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setShowScore(true);
            if (onGameComplete) {
                onGameComplete(score, elapsedTime);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const keyboard = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    if (showScore) {
        return (
            <div className="flex items-center justify-center min-h-[500px] p-4">
                <div className="glass-panel max-w-md w-full p-8 text-center animate-scale-in">
                    <div className="size-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="size-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Game Over!</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-8">
                        You've completed all the challenges. Well done!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-xs text-primary uppercase font-bold mb-1">Total Score</p>
                            <p className="text-2xl font-black text-primary">{score}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Time</p>
                            <p className="text-2xl font-black text-slate-700 dark:text-white">{formatTime(elapsedTime)}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {!onGameComplete && (
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setGuessedLetters([]);
                                    setWrongGuesses(0);
                                    setGameStatus('playing');
                                    setScore(0);
                                    setShowScore(false);
                                    setElapsedTime(0);
                                    startTimeRef.current = Date.now();
                                }}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl h-16 px-10 bg-primary hover:bg-primary-dark text-white text-xl font-black leading-normal tracking-wide shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] transition-all active:scale-95 group"
                            >
                                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span>
                                <span>Play Again</span>
                            </button>
                        )}
                        <button
                            onClick={handleExit}
                            className="flex items-center justify-center gap-3 w-full h-14 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[#111318] dark:text-white rounded-2xl font-bold transition-all"
                        >
                            <span className="material-symbols-outlined">home</span> Back to Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col justify-start py-6 px-4 sm:px-6 lg:px-8 w-full min-h-screen relative overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex flex-col max-w-[1024px] w-full gap-4 mx-auto relative z-10">
                <GameHeader title="Word Image Challenge" onShare={onShare} onExit={handleExit}>
                    {onAssign && (
                        <button
                            onClick={onAssign}
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-bold border border-primary/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            <span className="hidden sm:inline">Assign</span>
                        </button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a202c] rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
                        <Timer className="text-primary size-5" />
                        <span className="font-bold font-mono text-lg text-slate-900 dark:text-white">{formatTime(elapsedTime)}</span>
                    </div>
                </GameHeader>

                <div className="bg-white dark:bg-[#12161f] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#151b26]/50">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <span className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                <Zap className="size-3 sm:size-4 text-primary" /> Attempts
                            </span>
                            <div className="flex gap-1 sm:gap-1.5">
                                {[...Array(maxWrongGuesses)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-4 sm:w-6 h-6 sm:h-8 rounded-sm sm:rounded-md transition-all duration-500",
                                            i < livesRemaining
                                                ? "bg-gradient-to-t from-primary to-indigo-400 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                                                : "bg-slate-200 dark:bg-gray-800 opacity-40 grayscale"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-slate-500 dark:text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Score</span>
                            <span className="text-primary text-xl sm:text-2xl font-black">{score}</span>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row min-h-[420px]">
                        {/* Image/Hint Area */}
                        <div className="lg:w-1/2 bg-slate-50 dark:bg-[#0d1117] flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
                            <div className="w-full aspect-square max-w-[280px] sm:max-w-sm rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-center relative group">
                                {currentWordObj.imageUrl ? (
                                    <img
                                        src={currentWordObj.imageUrl}
                                        alt="Clue"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-300 dark:text-slate-700">
                                        <ImageIcon size={48} strokeWidth={1} />
                                        <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">No Image</p>
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-6 left-6 text-xs text-slate-400 font-mono tracking-tighter uppercase font-bold">
                                Round {currentIndex + 1} / {words.length}
                            </div>
                        </div>

                        {/* Decoding Area */}
                        <div className="lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center items-center gap-6 sm:gap-10 bg-white dark:bg-[#12161f]">
                            <div className="w-full">
                                <p className="text-center text-slate-400 dark:text-gray-500 text-[10px] sm:text-xs font-black mb-4 sm:mb-8 uppercase tracking-[0.3em]">Decode the Word</p>
                                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 select-none">
                                    {wordToGuess.split('').map((char: string, index: number) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <span className={cn(
                                                "w-8 sm:w-12 h-10 sm:h-16 flex items-center justify-center text-2xl sm:text-5xl font-black border-b-2 sm:border-b-4 transition-all duration-300",
                                                guessedLetters.includes(char) || char === ' ' || gameStatus !== 'playing'
                                                    ? "text-slate-900 dark:text-white border-primary bg-primary/5 shadow-[0_10px_20px_-10px_rgba(var(--primary-rgb),0.3)]"
                                                    : "text-transparent border-slate-200 dark:border-gray-800"
                                            )}>
                                                {char === ' ' ? '\u00A0' : (guessedLetters.includes(char) || gameStatus === 'lost' ? char : '')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-primary/5 border border-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-start gap-3 sm:gap-4 w-full relative group">
                                <div className="absolute -top-3 -right-2 sm:-right-3 bg-primary size-7 sm:size-8 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg rotate-12">
                                    <span className="material-symbols-outlined text-white text-[14px] sm:text-sm">lightbulb</span>
                                </div>
                                <div className="space-y-0.5 sm:space-y-1">
                                    <p className="text-primary font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Detective's Hint</p>
                                    <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-semibold">
                                        "{currentWordObj.hint}"
                                    </p>
                                </div>
                            </div>

                            {gameStatus === 'lost' && (
                                <div className="flex items-center gap-2 text-red-500 font-black animate-bounce bg-red-500/10 px-6 py-3 rounded-2xl border border-red-500/20">
                                    <AlertTriangle size={24} /> WRONG GUESS!
                                </div>
                            )}
                            {gameStatus === 'won' && (
                                <div className="flex items-center gap-2 text-green-500 font-black animate-pulse bg-green-500/10 px-6 py-3 rounded-2xl border border-green-500/20">
                                    <Trophy size={24} /> EXCELLENT WORK!
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4 sm:p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0d1117]/80 backdrop-blur-md">
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2.5 max-w-3xl mx-auto">
                            {keyboard.map((char) => {
                                const isGuessed = guessedLetters.includes(char);
                                const isCorrect = wordToGuess.includes(char);

                                return (
                                    <button
                                        key={char}
                                        onClick={() => handleGuess(char)}
                                        disabled={isGuessed || gameStatus !== 'playing'}
                                        className={cn(
                                            "flex size-9 sm:size-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl shadow-md font-black text-base sm:text-xl transition-all duration-200 uppercase",
                                            isGuessed && isCorrect && "bg-green-500 text-white scale-90",
                                            isGuessed && !isCorrect && "bg-red-500/20 text-red-500 border border-red-500/30 opacity-40",
                                            !isGuessed && "bg-white dark:bg-[#1c2331] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-primary hover:text-white hover:-translate-y-1 shadow-[0_3px_0_theme(colors.slate.200)] sm:shadow-[0_4px_0_theme(colors.slate.200)] dark:shadow-[0_3px_0_theme(colors.slate.900)] sm:dark:shadow-[0_4px_0_theme(colors.slate.900)] active:translate-y-[2px] active:shadow-none",
                                            gameStatus !== 'playing' && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {gameStatus !== 'playing' && (
                        <div className="flex justify-center p-8 bg-gray-50 dark:bg-[#12161f] border-t border-gray-200 dark:border-gray-800 animate-fade-in">
                            <button
                                onClick={handleNextWord}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl h-16 px-10 bg-primary hover:bg-primary-dark text-white text-xl font-black leading-normal tracking-wide shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] transition-all active:scale-95 group"
                            >
                                <span>{currentIndex < words.length - 1 ? 'Next Challenge' : 'Finish Game'}</span>
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {isSubmitting && (
                <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-primary mx-auto mb-6" size={64} />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Saving Your Victory...</h3>
                        <p className="text-primary mt-2 font-mono">Syncing with headquarters</p>
                    </div>
                </div>
            )}
        </div>
    );
};
