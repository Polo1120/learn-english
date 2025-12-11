import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle, Loader2, Trophy } from 'lucide-react';
import { sessionService } from '../services/sessionService.js';
import { NicknameEntry } from '../components/NicknameEntry';
import { QuizGame } from '../components/QuizGame';
import { HangmanGame } from '../components/HangmanGame';
import type { GameSessionExpanded, SessionScore } from '../types';

const NICKNAME_STORAGE_KEY = 'session_nickname_';
const GAME_COMPLETED_KEY = 'session_game_completed_';

export const PublicGameSession = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<GameSessionExpanded | null>(null);
    const [nickname, setNickname] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [scores, setScores] = useState<SessionScore[]>([]);
    const [submittingScore, setSubmittingScore] = useState(false);

    const [canPlayAgain, setCanPlayAgain] = useState(true);

    useEffect(() => {
        const loadSession = async () => {
            if (!sessionId) {
                setError('Código de sesión inválido');
                setLoading(false);
                return;
            }

            try {
                const sessionData = await sessionService.getSessionByCode(sessionId);

                if (!sessionData) {
                    setError('Sesión no encontrada');
                    setLoading(false);
                    return;
                }

                if (!sessionService.isSessionActive(sessionData)) {
                    setError('Esta sesión ha expirado o está inactiva');
                    setLoading(false);
                    return;
                }

                setSession(sessionData);

                const storedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY + sessionId);
                if (storedNickname) {
                    setNickname(storedNickname);
                    const leaderboard = await sessionService.getLeaderboard(sessionId);
                    const userScore = leaderboard.find(s => s.nickname === storedNickname);

                    if (userScore) {

                        setScores(leaderboard);

                        // Restore game completed state from localStorage
                        const gameCompletedState = localStorage.getItem(GAME_COMPLETED_KEY + sessionId);
                        if (gameCompletedState === 'true') {
                            setGameCompleted(true);
                        }

                        if (sessionData.max_attempts && sessionData.max_attempts <= 1) {
                            setCanPlayAgain(false);
                        }
                    }
                } else {
                    const leaderboard = await sessionService.getLeaderboard(sessionId);
                    setScores(leaderboard);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error loading session:', err);
                setError('Error al cargar la sesión');
                setLoading(false);
            }
        };

        loadSession();
    }, [sessionId]);


    useEffect(() => {
        if (!sessionId || !session) return;

        const unsubscribe = sessionService.subscribeToLeaderboard(session.id, (newScore) => {
            setScores(prev => {

                const exists = prev.find(s => s.id === newScore.id);
                if (exists) return prev;


                const updated = [...prev, newScore];
                return updated.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return (a.time_taken || 0) - (b.time_taken || 0);
                });
            });
        });

        return () => {
            unsubscribe();
        };
    }, [sessionId, session]);

    const handleNicknameSubmit = (submittedNickname: string) => {
        if (!sessionId) return;


        localStorage.setItem(NICKNAME_STORAGE_KEY + sessionId, submittedNickname);
        setNickname(submittedNickname);
    };

    const handleGameComplete = async (score: number, timeInSeconds: number) => {
        if (!sessionId || !nickname || submittingScore) return;

        setSubmittingScore(true);
        try {
            await sessionService.submitScore(sessionId, nickname, score, timeInSeconds);
            setGameCompleted(true);
            // Save game completed state to localStorage
            localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');



            const leaderboard = await sessionService.getLeaderboard(sessionId);
            setScores(leaderboard);


            if (session?.max_attempts && session.max_attempts <= 1) {
                setCanPlayAgain(false);
            }
        } catch (err: any) {
            console.error('Error submitting score:', err);

            if (err.message?.includes('límite')) {
                alert(err.message);
                setGameCompleted(true);
                localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');
                setCanPlayAgain(false);
            } else if (err.message?.includes('No superaste')) {
                alert(err.message + '\n\nTu mejor puntuación se mantiene en el leaderboard.');
                setGameCompleted(true);
                localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');
            } else {
                alert('Error al enviar puntuación. Por favor intenta de nuevo.');
            }
        } finally {
            setSubmittingScore(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
                    <p className="text-slate-600">Cargando sesión...</p>
                </div>
            </div>
        );
    }


    if (error || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card max-w-md text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-slate-600 mb-6">{error || 'Sesión no encontrada'}</p>
                    <Link to="/" className="btn btn-primary">
                        Ir al Inicio
                    </Link>
                </div>
            </div>
        );
    }


    if (!nickname) {
        return <NicknameEntry onSubmit={handleNicknameSubmit} sessionTitle={session.title} />;
    }


    if (gameCompleted) {
        return (
            <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark overflow-x-hidden font-display">
                {/* Background Gradients */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]"></div>
                </div>

                <div className="relative z-10 layout-container flex h-full grow flex-col">
                    {/* Navbar */}
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#282e39] px-4 py-3 lg:px-10 glass-panel sticky top-0 z-50">
                        <div className="flex items-center gap-4 text-white">
                            <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                                <span className="material-symbols-outlined text-xl">school</span>
                            </div>
                            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">English Quest</h2>
                        </div>
                        {/* Live Indicator */}
                        <div className="hidden sm:flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-red-400 text-xs font-bold tracking-wider">LIVE SESSION #{sessionId}</span>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="flex flex-1 justify-center py-5 px-4 md:px-10 lg:px-40">
                        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-8">
                            {/* Mobile Live Indicator */}
                            <div className="flex sm:hidden justify-center items-center gap-2 mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                <p className="text-red-400 text-xs font-bold tracking-widest">LIVE SESSION #{sessionId}</p>
                            </div>

                            {/* Celebration Card */}
                            <div className="glass-panel rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between animate-fade-in-up">
                                {/* Trophy Image */}
                                <div className="w-full max-w-[280px] md:w-1/3 flex justify-center">
                                    <div className="relative w-48 h-48 md:w-56 md:h-56">
                                        {/* Glow effect behind trophy */}
                                        <div className="absolute inset-0 bg-yellow-500/20 blur-[40px] rounded-full"></div>
                                        <img
                                            alt="Golden Trophy"
                                            className="relative w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_x-xoK6KFQ2y9ujcXAqvl1ucSNdJo2xR8S2P96gx4X15u7hfEzsJDPARwafb9_uGmBkWxwztzCKmdM7OuBEFYjMJGw83Asnj8a8bWjXBW330iDuQJBGfWehVH1ykHKzLVciQwn248x0Wrdskm4fg2m4DJiLmIhNF4Bo9OqSsW6-LwtJEWyEZ6U9dc_0EjHsL4xanhnuvpnsd5QR8yZsViTuXiL4m-TY7pR_q4Q-m6At3OXNbRrzBHuIDLIjJbvTpnwYEi3RjxnXs"
                                        />
                                    </div>
                                </div>
                                {/* Text Content */}
                                <div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left flex-1">
                                    <div className="flex flex-col gap-2">
                                        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                            ¡Juego Completado!
                                        </h1>
                                        <h2 className="text-gray-300 text-lg font-medium leading-normal">
                                            Gracias por participar, <span className="text-white font-bold">{nickname}</span>.
                                        </h2>
                                        {!canPlayAgain && (
                                            <p className="text-yellow-500/90 text-sm font-medium bg-yellow-500/10 px-3 py-1 rounded-lg w-fit mx-auto md:mx-0 mt-2 border border-yellow-500/20">
                                                ⚠️ Has alcanzado el límite de intentos
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start w-full">
                                        <button
                                            onClick={() => {
                                                navigator.share?.({
                                                    title: session.title,
                                                    text: '¡Únete a esta sesión de juego!',
                                                    url: window.location.href,
                                                });
                                            }}
                                            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(19,91,236,0.4)] text-white text-base font-bold leading-normal tracking-[0.015em]"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">share</span>
                                            <span className="truncate">Compartir</span>
                                        </button>
                                        {canPlayAgain && (
                                            <button
                                                onClick={() => {

                                                    localStorage.removeItem(GAME_COMPLETED_KEY + sessionId);
                                                    window.location.reload();
                                                }}
                                                className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-transparent border border-gray-600 hover:bg-white/5 transition-all text-white text-base font-bold leading-normal tracking-[0.015em]"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">replay</span>
                                                <span className="truncate">Jugar de Nuevo</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Leaderboard Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between px-2">
                                    <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Tabla de Clasificación</h2>
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">schedule</span> En vivo
                                    </div>
                                </div>
                                <div className="glass-panel rounded-xl overflow-hidden">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#1c1f27]/50 border-b border-white/5 text-gray-400 text-sm font-medium uppercase tracking-wider">
                                                <th className="px-6 py-4 w-24">Posición</th>
                                                <th className="px-6 py-4">Nickname</th>
                                                <th className="px-6 py-4 text-right">Puntuación</th>
                                                <th className="px-6 py-4 text-right hidden sm:table-cell">Tiempo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {scores.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                        Esperando puntuaciones...
                                                    </td>
                                                </tr>
                                            ) : (
                                                scores.map((score, index) => {
                                                    const isCurrentUser = score.nickname === nickname;
                                                    const rank = index + 1;
                                                    const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                                                    const initials = score.nickname.substring(0, 2).toUpperCase();
                                                    const formatTime = (seconds?: number) => {
                                                        if (!seconds) return '--:--';
                                                        const mins = Math.floor(seconds / 60);
                                                        const secs = seconds % 60;
                                                        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                                    };

                                                    return (
                                                        <tr
                                                            key={score.id}
                                                            className={`hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-primary/20 border-l-4 border-l-primary shadow-[inset_0_0_20px_rgba(19,91,236,0.1)]' : ''}`}
                                                        >
                                                            <td className="px-6 py-4 text-white font-bold text-lg">
                                                                <div className="flex items-center gap-2">
                                                                    {medalEmoji && <span className="text-2xl">{medalEmoji}</span>}
                                                                    {rank}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser
                                                                        ? 'bg-primary text-white shadow-lg'
                                                                        : rank === 1
                                                                            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-500'
                                                                            : rank === 2
                                                                                ? 'bg-gray-400/20 border border-gray-400/40 text-gray-300'
                                                                                : rank === 3
                                                                                    ? 'bg-orange-700/20 border border-orange-700/40 text-orange-400'
                                                                                    : 'bg-slate-700 text-slate-300'
                                                                        }`}>
                                                                        {initials}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`font-medium ${isCurrentUser ? 'text-white font-bold text-lg' : 'text-white'}`}>
                                                                            {score.nickname} {isCurrentUser && '(Tú)'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className={`font-bold ${isCurrentUser
                                                                    ? 'text-primary text-2xl drop-shadow-[0_0_10px_rgba(19,91,236,0.5)]'
                                                                    : rank === 1
                                                                        ? 'text-yellow-400 text-xl drop-shadow-sm'
                                                                        : rank === 2
                                                                            ? 'text-gray-300 text-xl'
                                                                            : rank === 3
                                                                                ? 'text-orange-400 text-xl'
                                                                                : 'text-gray-400 text-lg'
                                                                    }`}>
                                                                    {score.score}
                                                                </span> pts
                                                            </td>
                                                            <td className={`px-6 py-4 text-right font-mono hidden sm:table-cell ${isCurrentUser ? 'text-gray-300' : 'text-gray-400'}`}>
                                                                {formatTime(score.time_taken)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    const game = session.expand?.game;
    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-slate-600">No se pudo cargar el juego</p>
                </div>
            </div>
        );
    }

    // --- New Layout Render ---

    const isQuiz = game?.type === 'quiz';
    const isHangman = game?.type === 'hangman';

    // Helper to get formatted best score
    const bestScore = Math.max(...scores.map(s => s.score), 0);

    return (
        <div className="bg-background-dark text-white font-display min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Vibrant Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Header / Top Bar */}
            <header className="relative z-20 w-full border-b border-white/10 bg-[#111318]/80 backdrop-blur-md">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    {/* Left: Session Title */}
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="hidden sm:flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                            <span className="material-symbols-outlined">school</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="text-base sm:text-lg font-bold leading-tight truncate">Sesión: {session?.title || 'Cargando...'}</h2>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                                <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span>En vivo</span>
                                <span className="mx-1">•</span>
                                <span className="font-medium text-white">Código: {sessionId}</span>
                            </div>
                        </div>
                    </div>

                    {/* Center: Playing As (Desktop/Tablet) */}
                    <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5">
                        <div className="size-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[10px] font-bold uppercase">
                            {nickname?.substring(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-300">Jugando como: <span className="text-white font-bold">{nickname}</span></span>
                    </div>

                    {/* Right: Stats */}
                    <div className="flex items-center gap-3 sm:gap-6 text-sm">
                        <div className="flex flex-col items-end sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <div className="flex items-center gap-1.5 text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <span className="material-symbols-outlined text-[18px]">group</span>
                                <span className="font-bold text-white">{scores.length}</span>
                                <span className="hidden sm:inline text-xs font-normal">participantes</span>
                            </div>
                            {scores.length > 0 && (
                                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                    <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                                    <span className="hidden sm:inline text-xs text-yellow-200">Mejor:</span>
                                    <span className="font-bold">{bestScore} pts</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-start p-4 md:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
                <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start h-full">

                    {/* Game Column */}
                    <div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto lg:mx-0">
                        {isQuiz && game.content.questions && (
                            <QuizGame
                                questions={game.content.questions}
                                onGameComplete={handleGameComplete}
                            />
                        )}
                        {isHangman && game.content.words && (
                            <HangmanGame
                                words={game.content.words}
                                onGameComplete={handleGameComplete}
                            />
                        )}
                        {!isQuiz && !isHangman && (
                            <div className="glass-panel p-8 text-center text-gray-400">
                                Juego no soportado en esta vista.
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <aside className="w-full h-full hidden lg:block">
                        <div className="glass-panel p-5 rounded-xl flex flex-col gap-4 sticky top-6 bg-surface-dark/60 backdrop-blur-md border border-white/10">
                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                    <Trophy className="text-yellow-500" size={20} />
                                    Top Players
                                </h3>
                                <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-md">Live</span>
                            </div>

                            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                                {scores.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">Esperando puntuaciones...</p>
                                ) : (
                                    scores.map((score, index) => {
                                        const isCurrentUser = score.nickname === nickname;
                                        const rank = index + 1;

                                        // Top 1 Styling
                                        if (rank === 1) {
                                            return (
                                                <div key={score.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 shadow-sm relative overflow-hidden group hover:bg-white/5 transition-colors">
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                                                    <div className="size-8 flex items-center justify-center text-2xl drop-shadow-sm">🥇</div>
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span className="text-sm font-bold text-white truncate">{score.nickname} {isCurrentUser && '(Tú)'}</span>
                                                        <span className="text-xs text-yellow-200/80">{score.score} pts</span>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // Standard styling
                                        return (
                                            <div key={score.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCurrentUser ? 'bg-primary/20 border-primary/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                <div className="size-8 flex items-center justify-center text-xl text-gray-300">
                                                    {rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-sm font-bold text-gray-500">#{rank}</span>}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className={`text-sm font-bold truncate ${isCurrentUser ? 'text-white' : 'text-gray-200'}`}>{score.nickname} {isCurrentUser && '(Tú)'}</span>
                                                    <span className={`text-xs ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>{score.score} pts</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </aside>

                </div>
            </main>

        </div>
    );
};
