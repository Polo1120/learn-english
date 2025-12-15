import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { HangmanWord } from '../types';
import { ArrowRight } from 'lucide-react';
import { GameHeader } from './GameHeader';

interface HangmanGameProps {
    words: HangmanWord[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
    onShare?: () => void;
    onExit?: () => void;
}

export const HangmanGame = ({ words, onGameComplete, onShare }: HangmanGameProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    const [score, setScore] = useState(0);
    const [startTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);

    const currentWordObj = words[currentIndex];
    const wordToGuess = currentWordObj.word.toUpperCase();
    const maxWrongGuesses = 6;
    const livesRemaining = Math.max(0, maxWrongGuesses - wrongGuesses);

    useEffect(() => {
        const interval = setInterval(() => {
            if (gameStatus === 'playing') {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime, gameStatus]);

    useEffect(() => {
        resetRound();
    }, [currentIndex]);

    const resetRound = () => {
        setGuessedLetters([]);
        setWrongGuesses(0);
        setGameStatus('playing');
    };

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
            const isWordComplete = wordToGuess.split('').every(char =>
                char === ' ' || [...guessedLetters, letter].includes(char)
            );
            if (isWordComplete) {
                setGameStatus('won');
                setScore(score + 10); // 10 points per word
            }
        }
    };

    const handleNextWord = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Game completed
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

    return (
        <div className="flex-1 flex justify-center py-6 px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col max-w-[1024px] w-full gap-6">
                {/* Page Heading & Context */}
                <GameHeader title="Jugando Hangman" onShare={onShare}>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a202c] rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
                        <span className="material-symbols-outlined text-primary text-xl">timer</span>
                        <span className="font-bold font-mono text-lg text-[#111318] dark:text-white">{formatTime(elapsedTime)}</span>
                    </div>
                </GameHeader>

                {/* Game Card Container */}
                <div className="bg-white dark:bg-[#1a202c] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
                    {/* Game Stats Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#151b26]">
                        <div className="flex items-center gap-3">
                            <span className="text-[#616f89] dark:text-gray-400 text-sm font-bold uppercase tracking-wide">Vidas Restantes</span>
                            <div aria-label={`${livesRemaining} out of ${maxWrongGuesses} lives remaining`} className="flex gap-1 text-2xl tracking-widest">
                                {[...Array(maxWrongGuesses)].map((_, i) => (
                                    <span key={i} className={i < livesRemaining ? "text-red-500 drop-shadow-sm" : "text-gray-300 dark:text-gray-600 grayscale"}>
                                        ❤️
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#616f89] dark:text-gray-400 text-sm font-bold uppercase tracking-wide">Puntuación</span>
                            <span className="text-primary text-2xl font-extrabold leading-none">{score}</span>
                        </div>
                    </div>

                    {/* Game Area: Visuals + Word */}
                    <div className="flex flex-col-reverse lg:flex-row min-h-[400px]">
                        {/* Left: Illustration */}
                        <div className="lg:w-5/12 bg-[#f0f2f4] dark:bg-[#101622] flex items-center justify-center p-8 relative border-r border-gray-100 dark:border-gray-800">
                            {/* Minimalist Hangman SVG */}
                            <svg className="text-[#111318] dark:text-gray-200" fill="none" height="240" viewBox="0 0 200 200" width="240" xmlns="http://www.w3.org/2000/svg">
                                {/* Base */}
                                <path d="M40 180H160" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                {/* Pole */}
                                <path d="M100 180V40" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                {/* Top Bar */}
                                <path d="M100 40H160" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path>
                                {/* Rope */}
                                <path d="M160 40V60" stroke="currentColor" strokeWidth="3"></path>
                                {/* Head (Wrong 1) */}
                                {wrongGuesses >= 1 && <circle cx="160" cy="75" r="15" stroke="currentColor" strokeWidth="3"></circle>}
                                {/* Body (Wrong 2) */}
                                {wrongGuesses >= 2 && <path d="M160 90V130" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>}
                                {/* Left Arm (Wrong 3) */}
                                {wrongGuesses >= 3 && <path d="M160 100L140 115" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>}
                                {/* Right Arm (Wrong 4) */}
                                {wrongGuesses >= 4 && <path d="M160 100L180 115" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>}
                                {/* Left Leg (Wrong 5) */}
                                {wrongGuesses >= 5 && <path d="M160 130L145 155" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>}
                                {/* Right Leg (Wrong 6) */}
                                {wrongGuesses >= 6 && <path d="M160 130L175 155" stroke="currentColor" strokeWidth="3" strokeLinecap="round"></path>}
                            </svg>
                            {/* Illustration Decoration */}
                            <div className="absolute bottom-4 left-4 text-xs text-gray-400 dark:text-gray-600 font-mono">Word {currentIndex + 1} / {words.length}</div>
                        </div>

                        {/* Right: Word Puzzle & Hint */}
                        <div className="lg:w-7/12 p-8 flex flex-col justify-center items-center gap-8 bg-white dark:bg-[#1a202c]">
                            {/* The Word */}
                            <div className="w-full">
                                <p className="text-center text-[#616f89] dark:text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">Palabra Oculta</p>
                                <div className="flex flex-wrap justify-center gap-2 md:gap-4 select-none">
                                    {wordToGuess.split('').map((char, index) => (
                                        <div key={index} className="flex flex-col items-center gap-1 group">
                                            <span className={cn(
                                                "w-10 md:w-14 h-12 md:h-16 flex items-center justify-center text-3xl md:text-5xl font-extrabold border-b-4",
                                                guessedLetters.includes(char) || char === ' ' || gameStatus !== 'playing'
                                                    ? "text-[#111318] dark:text-white border-gray-300 dark:border-gray-600"
                                                    : "text-transparent border-gray-300 dark:border-gray-600"
                                            )}>
                                                {char === ' ' ? '\u00A0' : (guessedLetters.includes(char) || gameStatus === 'lost' ? char : '_')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Hint Card */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3 max-w-md w-full">
                                <span className="material-symbols-outlined text-primary mt-0.5">lightbulb</span>
                                <div>
                                    <p className="text-primary dark:text-blue-400 font-bold text-sm mb-1">Pista</p>
                                    <p className="text-[#111318] dark:text-gray-200 text-sm leading-relaxed">
                                        {currentWordObj.hint}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Keyboard Section */}
                    <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a202c]">
                        <p className="text-center text-[#616f89] dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Teclado Virtual</p>
                        <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
                            {keyboard.map((char) => {
                                const isGuessed = guessedLetters.includes(char);
                                const isCorrect = wordToGuess.includes(char);

                                return (
                                    <button
                                        key={char}
                                        onClick={() => handleGuess(char)}
                                        disabled={isGuessed || gameStatus !== 'playing'}
                                        className={cn(
                                            "flex size-10 md:size-12 shrink-0 items-center justify-center rounded-lg shadow-sm font-bold text-lg md:text-xl transition-all",
                                            isGuessed && isCorrect && "bg-green-500 text-white transform active:scale-95",
                                            isGuessed && !isCorrect && "bg-red-500 text-white opacity-50 cursor-not-allowed",
                                            !isGuessed && "bg-[#f0f2f4] dark:bg-gray-700 text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-md",
                                            gameStatus !== 'playing' && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {char}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions / Next Button */}
                    {gameStatus !== 'playing' && (
                        <div className="flex justify-center p-6 bg-gray-50 dark:bg-[#151b26] border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                            <button
                                onClick={handleNextWord}
                                className="flex min-w-[200px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-14 px-8 bg-primary hover:bg-primary-dark text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/30 transition-all active:scale-95"
                            >
                                <span>{currentIndex < words.length - 1 ? 'Siguiente Palabra' : 'Finalizar Juego'}</span>
                                <ArrowRight size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
