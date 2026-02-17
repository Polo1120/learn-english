import { useState, useEffect, useRef } from 'react';
import { cn } from '../../../shared/lib/utils';
import { GameHeader } from './GameHeader';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../../shared/types';
import { RefreshCw, Loader2 } from 'lucide-react';

interface QuizGameProps {
    questions: Question[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
    onShare?: () => void;
    onExit?: () => void;
    onAssign?: () => void;
    isSubmitting?: boolean;
}

export const QuizGame = ({ questions, onGameComplete, onShare, onAssign, isSubmitting, onExit }: QuizGameProps) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const startTimeRef = useRef<number | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        startTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!showScore) {
            interval = setInterval(() => {
                if (startTimeRef.current) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [showScore]);




    const handleExit = () => {
        if (onExit) {
            onExit();
        } else {
            navigate('/');
        }
    };

    const handleAnswerClick = (index: number) => {
        if (isAnswered) return;

        setSelectedAnswer(index);
        setIsAnswered(true);

        if (index === questions[currentIndex].correctAnswer) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        const nextQuestion = currentIndex + 1;
        if (nextQuestion < questions.length) {
            setCurrentIndex(nextQuestion);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowScore(true);
            if (onGameComplete) {
                onGameComplete(score, elapsedTime);
            }
        }
    };

    const resetQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setShowScore(false);
        setSelectedAnswer(null);
        setIsAnswered(false);
        startTimeRef.current = Date.now();
        setElapsedTime(0);
    };


    const progressPercentage = ((currentIndex + 1) / questions.length) * 100;


    const getOptionLetter = (index: number) => String.fromCharCode(65 + index);


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };




    if (showScore) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 sm:p-12 text-center max-w-lg w-full">
                    <h2 className="text-3xl font-extrabold mb-6 text-[#111318] dark:text-white">Quiz Completed!</h2>
                    <div className="text-6xl font-black text-primary mb-6">
                        {score} / {questions.length}
                    </div>
                    <p className="text-[#637588] dark:text-gray-400 text-lg mb-2">
                        You scored <span className="font-bold text-[#111318] dark:text-white">{Math.round((score / questions.length) * 100)}%</span>
                    </p>
                    <p className="text-sm text-[#637588] dark:text-gray-500 mb-8">
                        Time: {formatTime(elapsedTime)}
                    </p>
                    <div className="flex flex-col gap-3">
                        {!onGameComplete && (
                            <button
                                onClick={resetQuiz}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl h-16 px-10 bg-primary hover:bg-primary-dark text-white text-xl font-black leading-normal tracking-wide shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] transition-all active:scale-95 group"
                            >
                                <RefreshCw className="group-hover:rotate-180 transition-transform duration-500" size={24} />
                                <span>Play Again</span>
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

    const currentQuestion = questions[currentIndex];

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-[#111318] dark:text-white min-h-screen flex flex-col">



            <main className="flex-1 flex justify-center py-6 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[960px] flex flex-col gap-6">

                    <GameHeader
                        title="Quiz Session"
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
                    {/* Progress and Stats Bar */}
                    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm sm:text-base font-bold text-[#111318] dark:text-white gap-2">
                            <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">help</span>
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                            <span className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined">trophy</span>
                                Score: {score}
                            </span>
                        </div>
                        <div className="relative w-full h-3 bg-[#dbdfe6] dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}>
                                <div className="absolute top-0 right-0 bottom-0 w-full h-full bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                    </div>


                    <div className="flex flex-col gap-6">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8 sm:p-12 text-center flex flex-col justify-center min-h-[240px] relative overflow-hidden group">

                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-indigo-400 to-primary"></div>
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                            <h2 className="relative z-10 text-[#111318] dark:text-white text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight tracking-tight">
                                {currentQuestion.text}
                            </h2>
                        </div>


                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {currentQuestion.options.map((option, index) => {
                                const isCorrect = index === currentQuestion.correctAnswer;
                                const isSelected = selectedAnswer === index;
                                const isWrong = isSelected && !isCorrect;
                                const isHighlighted = isAnswered && (isCorrect || isWrong);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerClick(index)}
                                        disabled={isAnswered}
                                        className={cn(
                                            "relative flex items-center p-6 gap-4 rounded-xl border-2 transition-all duration-200 transform group",
                                            // Default State (Not Answered)
                                            !isAnswered && "bg-white dark:bg-gray-800 border-gray-100 dark:border-transparent hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/10 hover:-translate-y-1",
                                            // Correct State
                                            isAnswered && isCorrect && "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20 scale-[1.02]",
                                            // Wrong State
                                            isAnswered && isWrong && "bg-red-500 text-white border-red-500 shadow-md",
                                            // Other State (Disabled)
                                            isAnswered && !isCorrect && !isSelected && "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-[0.4] cursor-not-allowed"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center size-10 rounded-full font-bold text-lg shrink-0 transition-colors",
                                            // Not Highlighted (Default + Other)
                                            !isHighlighted && "bg-gray-100 dark:bg-gray-800 text-[#616f89] dark:text-gray-400",
                                            // Hover effects only when active
                                            !isAnswered && "group-hover:bg-primary/10 group-hover:text-primary",
                                            // Highlighted (Correct or Wrong)
                                            isHighlighted && "bg-white/20 text-white"
                                        )}>
                                            {getOptionLetter(index)}
                                        </div>
                                        <span className={cn(
                                            "text-left text-lg font-bold leading-snug flex-1",
                                            // Not Highlighted
                                            !isHighlighted && "text-[#111318] dark:text-white",
                                            // Hover effects only when active
                                            !isAnswered && "group-hover:text-primary",
                                            // Highlighted
                                            isHighlighted && "text-white"
                                        )}>
                                            {option}
                                        </span>
                                        {isAnswered && isCorrect && (
                                            <span className="material-symbols-outlined text-2xl">check_circle</span>
                                        )}
                                        {isAnswered && isWrong && (
                                            <span className="material-symbols-outlined text-2xl animate-pulse">cancel</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {isAnswered && (
                        <div className="flex justify-center pt-8 pb-10 animate-fade-in-up">
                            <button
                                onClick={handleNextQuestion}
                                className="flex min-w-[240px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-2xl h-16 px-10 bg-primary hover:bg-primary-dark text-white text-xl font-black leading-normal tracking-wide shadow-[0_10px_25px_-5px_rgba(var(--primary-rgb),0.4)] transition-all active:scale-95 group"
                            >
                                <span>{currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}</span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
            {isSubmitting && (
                <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
                        <h3 className="text-xl font-bold">Submitting results...</h3>
                        <p className="text-slate-500">Please wait a moment</p>
                    </div>
                </div>
            )}
        </div>
    );
};

