import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '../../../shared/lib/utils';
import type { Question } from '../../../shared/types';
import { GameHeader } from './GameHeader';
import { Move, Timer, Trophy, AlertCircle, ChevronRight, Zap, Settings2 } from 'lucide-react';

interface MazeGameProps {
    questions: Question[];
    onGameComplete?: (score: number, timeInSeconds: number) => void;
    onShare?: () => void;
    onExit?: () => void;
    onAssign?: () => void;
}

type Cell = {
    r: number;
    c: number;
    walls: [boolean, boolean, boolean, boolean];
    visited: boolean;
};

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
    easy: { size: 8, label: 'Easy' },
    medium: { size: 12, label: 'Medium' },
    hard: { size: 16, label: 'Hard' }
};

export const MazeGame = ({ questions, onGameComplete, onShare, onAssign, onExit }: MazeGameProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [difficulty, setDifficulty] = useState<Difficulty>('easy');
    const [maze, setMaze] = useState<Cell[][]>([]);
    const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
    const [answerPositions, setAnswerPositions] = useState<{ r: number, c: number, index: number }[]>([]);
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'selecting'>('selecting');
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef<number | null>(null);

    const generateMaze = useCallback((size: number) => {
        const grid: Cell[][] = [];
        for (let r = 0; r < size; r++) {
            grid[r] = [];
            for (let c = 0; c < size; c++) {
                grid[r][c] = { r, c, walls: [true, true, true, true], visited: false };
            }
        }

        const stack: Cell[] = [];
        let current = grid[0][0];
        current.visited = true;

        const getNeighbors = (cell: Cell) => {
            const neighbors: { cell: Cell, dir: number }[] = [];
            const { r, c } = cell;

            if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ cell: grid[r - 1][c], dir: 0 });
            if (c < size - 1 && !grid[r][c + 1].visited) neighbors.push({ cell: grid[r][c + 1], dir: 1 });
            if (r < size - 1 && !grid[r + 1][c].visited) neighbors.push({ cell: grid[r + 1][c], dir: 2 });
            if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ cell: grid[r][c - 1], dir: 3 });

            return neighbors;
        };

        const removeWalls = (a: Cell, b: Cell, dir: number) => {
            a.walls[dir] = false;
            b.walls[(dir + 2) % 4] = false;
        };

        while (true) {
            const neighbors = getNeighbors(current);
            if (neighbors.length > 0) {
                const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
                removeWalls(current, next, dir);
                stack.push(current);
                current = next;
                current.visited = true;
            } else if (stack.length > 0) {
                current = stack.pop()!;
            } else {
                break;
            }
        }

        return grid;
    }, []);

    const setupRound = useCallback(() => {
        const size = DIFFICULTY_CONFIG[difficulty].size;
        const newMaze = generateMaze(size);
        setMaze(newMaze);
        setPlayerPos({ r: 0, c: 0 });

        const currentQuestion = questions[currentIndex];
        const positions: { r: number, c: number, index: number }[] = [];
        const usedPos = new Set<string>(['0,0']);

        currentQuestion.options.forEach((_, idx) => {
            let r, c;
            do {
                r = Math.floor(Math.random() * size);
                c = Math.floor(Math.random() * size);
            } while (usedPos.has(`${r},${c}`) || (r < 2 && c < 2));

            usedPos.add(`${r},${c}`);
            positions.push({ r, c, index: idx });
        });

        setAnswerPositions(positions);
        setGameStatus('playing');
        if (currentIndex === 0) {
            startTimeRef.current = Date.now();
        }
    }, [difficulty, generateMaze, questions, currentIndex]);

    useEffect(() => {
        if (gameStatus === 'playing') {
            const timer = setInterval(() => {
                if (startTimeRef.current) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [gameStatus]);

    const handleMove = useCallback((dir: number) => {
        if (gameStatus !== 'playing') return;

        const { r, c } = playerPos;
        const currentCell = maze[r][c];

        if (!currentCell.walls[dir]) {
            let nextR = r, nextC = c;
            if (dir === 0) nextR--;
            if (dir === 1) nextC++;
            if (dir === 2) nextR++;
            if (dir === 3) nextC--;

            setPlayerPos({ r: nextR, c: nextC });

            const reachedAnswer = answerPositions.find(ap => ap.r === nextR && ap.c === nextC);
            if (reachedAnswer) {
                if (reachedAnswer.index === questions[currentIndex].correctAnswer) {
                    setScore(prev => prev + 10);
                    setGameStatus('won');
                } else {
                    setGameStatus('lost');
                }
            }
        }
    }, [gameStatus, playerPos, maze, answerPositions, questions, currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'w') handleMove(0);
            if (e.key === 'ArrowRight' || e.key === 'd') handleMove(1);
            if (e.key === 'ArrowDown' || e.key === 's') handleMove(2);
            if (e.key === 'ArrowLeft' || e.key === 'a') handleMove(3);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMove]);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setGameStatus('playing');
            setupRound();
        } else {
            setShowScore(true);
            onGameComplete?.(score, elapsedTime);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExit = () => {
        if (onExit) onExit();
        else window.history.back();
    };

    if (showScore) {
        return (
            <div className="flex items-center justify-center min-h-[500px] p-4">
                <div className="glass-panel max-w-md w-full p-8 text-center animate-scale-in">
                    <div className="size-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="size-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Adventure Complete!</h2>
                    <p className="text-slate-500 dark:text-gray-400 mb-8">You've successfully wandered through the words.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <p className="text-xs text-primary uppercase font-bold mb-1">Final Score</p>
                            <p className="text-2xl font-black text-primary">{score}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Time taken</p>
                            <p className="text-2xl font-black text-slate-700 dark:text-white">{formatTime(elapsedTime)}</p>
                        </div>
                    </div>
                    <button onClick={handleExit} className="w-full h-14 bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-white rounded-2xl font-bold transition-all">Back to Hub</button>
                </div>
            </div>
        );
    }

    if (gameStatus === 'selecting') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-dark-bg">
                <div className="glass-panel p-10 max-w-xl w-full text-center space-y-8 animate-fade-in">
                    <div className="size-24 bg-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto rotate-12 group transition-transform hover:rotate-0"><Move className="size-12" /></div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Word Wanderer</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-lg">Navigate the maze to find the correct answer!</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Select Difficulty</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all font-bold",
                                        difficulty === d ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:border-primary/50"
                                    )}
                                >{DIFFICULTY_CONFIG[d].label}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={setupRound} className="w-full bg-primary hover:bg-emerald-400 text-slate-900 h-16 rounded-2xl text-lg text-white font-black shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group active:scale-95">Start Expedition <ChevronRight className="group-hover:translate-x-1 transition-transform" /></button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const size = DIFFICULTY_CONFIG[difficulty].size;

    return (
        <div className="flex-1 flex flex-col justify-start py-6 px-4 sm:px-6 lg:px-8 w-full min-h-screen relative overflow-hidden bg-slate-50 dark:bg-dark-bg transition-colors duration-300">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex flex-col max-w-[1024px] w-full gap-4 mx-auto relative z-10">
                <GameHeader title="Word Wanderer" onShare={onShare} onExit={handleExit}>
                    {onAssign && (
                        <button onClick={onAssign} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors text-sm font-bold border border-indigo-500/20"><span className="material-symbols-outlined text-[20px]">person_add</span><span className="hidden sm:inline">Assign</span></button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a202c] rounded-full dark:border-gray-700 shadow-sm">
                        <Timer className="text-primary size-5" /><span className="font-bold font-mono text-lg text-slate-900 dark:text-white">{formatTime(elapsedTime)}</span>
                    </div>
                </GameHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="">
                        <div className="glass-panel relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 text-primary opacity-10 group-hover:opacity-20 transition-opacity"><Zap className="size-24" /></div>
                            <div>
                                <p className="text-xs font-black text-primary uppercase tracking-widest">Question {currentIndex + 1} / {questions.length}</p>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{currentQuestion.text}</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-3 mt-8">
                                {currentQuestion.options.map((option, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border flex items-center gap-4 transition-all bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                        <div className="size-8 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-black text-slate-400">{String.fromCharCode(65 + idx)}</div>
                                        <span className="font-bold text-slate-700 dark:text-gray-300">{option}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center gap-3 mt-8"><Settings2 className="text-primary size-5" /><div className="text-sm"><span className="font-bold text-slate-600 dark:text-gray-400">Controls:</span><span className="ml-2 text-slate-500 dark:text-gray-400">Arrow keys or WASD to move</span></div></div>
                        </div>

                        {gameStatus !== 'playing' && (
                            <div className={cn("glass-panel p-8 text-center space-y-4 animate-in slide-in-from-bottom-4 duration-300", gameStatus === 'won' ? "border-green-500/20" : "border-red-500/20")}>
                                <div className={cn("size-16 rounded-full flex items-center justify-center mx-auto", gameStatus === 'won' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>{gameStatus === 'won' ? <Trophy size={32} /> : <AlertCircle size={32} />}</div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{gameStatus === 'won' ? 'Brilliant!' : 'A bit lost?'}</h3>
                                <p className="text-slate-500 dark:text-gray-400">{gameStatus === 'won' ? 'You reached the correct answer. The expedition continues!' : 'That portal led to a dead end. Try again!'}</p>
                                <button onClick={gameStatus === 'won' ? handleNext : setupRound} className={cn("w-full h-14 rounded-xl font-black transition-all flex items-center justify-center gap-2", gameStatus === 'won' ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white")}>{gameStatus === 'won' ? 'Next Sector' : 'Restart Sector'}<ChevronRight size={20} /></button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 relative" style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 1fr)`, width: '100%', maxWidth: '500px', aspectRatio: '1/1' }}>
                            {maze.map((row, r) => row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="relative flex items-center justify-center" style={{ borderTop: cell.walls[0] ? '2px solid' : 'none', borderRight: cell.walls[1] ? '2px solid' : 'none', borderBottom: cell.walls[2] ? '2px solid' : 'none', borderLeft: cell.walls[3] ? '2px solid' : 'none', borderColor: 'var(--maze-wall, #cbd5e1)' }}>
                                    {playerPos.r === r && playerPos.c === c && (
                                        <div className="absolute inset-1 bg-primary rounded-md flex items-center justify-center text-slate-900 shadow-lg shadow-primary/40 z-20 animate-pulse"><Move size={16} /></div>
                                    )}
                                    {answerPositions.find(ap => ap.r === r && ap.c === c) && (
                                        <div className="absolute inset-1 bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center z-10 group overflow-hidden"><div className="absolute inset-0 bg-indigo-500/20 animate-ping rounded-full" /><span className="font-black text-indigo-500 text-xs">{String.fromCharCode(64 + (answerPositions.find(ap => ap.r === r && ap.c === c)?.index || 0) + 1)}</span></div>
                                    )}
                                </div>
                            )))}
                        </div>

                        {/* Mobile D-Pad (Cruceta) */}
                        <div className="mt-8 md:hidden flex justify-center pb-12">
                            <div className="relative size-44 bg-slate-200/50 dark:bg-gray-800/80 rounded-full p-2 backdrop-blur-md border-2 border-white/50 dark:border-white/10 shadow-2xl overflow-hidden">
                                <div className="grid grid-cols-3 grid-rows-3 gap-1.5 h-full w-full p-1">
                                    <div />
                                    <button
                                        onPointerDown={() => handleMove(0)}
                                        className="flex items-center justify-center bg-white dark:bg-gray-700 shadow-md rounded-xl active:bg-primary active:text-white transition-all transform active:scale-90 border-b-2 border-gray-200 dark:border-gray-900"
                                    >
                                        <span className="material-symbols-outlined text-3xl">keyboard_arrow_up</span>
                                    </button>
                                    <div />
                                    <button
                                        onPointerDown={() => handleMove(3)}
                                        className="flex items-center justify-center bg-white dark:bg-gray-700 shadow-md rounded-xl active:bg-primary active:text-white transition-all transform active:scale-90 border-r-2 border-gray-200 dark:border-gray-900"
                                    >
                                        <span className="material-symbols-outlined text-3xl">keyboard_arrow_left</span>
                                    </button>
                                    <div className="flex items-center justify-center">
                                        <div className="size-2.5 bg-primary/40 rounded-full animate-pulse" />
                                    </div>
                                    <button
                                        onPointerDown={() => handleMove(1)}
                                        className="flex items-center justify-center bg-white dark:bg-gray-700 shadow-md rounded-xl active:bg-primary active:text-white transition-all transform active:scale-90 border-l-2 border-gray-200 dark:border-gray-900"
                                    >
                                        <span className="material-symbols-outlined text-3xl">keyboard_arrow_right</span>
                                    </button>
                                    <div />
                                    <button
                                        onPointerDown={() => handleMove(2)}
                                        className="flex items-center justify-center bg-white dark:bg-gray-700 shadow-md rounded-xl active:bg-primary active:text-white transition-all transform active:scale-90 border-t-2 border-gray-200 dark:border-gray-900"
                                    >
                                        <span className="material-symbols-outlined text-3xl">keyboard_arrow_down</span>
                                    </button>
                                    <div />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                :root { --maze-wall: #cbd5e1; } // gray-300 for better visibility
                .dark { --maze-wall: #334155; }
            `}</style>
        </div>
    );
};
