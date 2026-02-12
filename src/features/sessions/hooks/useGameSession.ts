
import { useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService';
import { useAuth } from '../../../context/AuthContext';
import type { GameSessionExpanded, SessionScore } from '../../../shared/types';

export const NICKNAME_STORAGE_KEY = 'session_nickname_';
export const GAME_COMPLETED_KEY = 'session_game_completed_';

export interface UseGameSessionProps {
    sessionId?: string;
}

export const useGameSession = ({ sessionId }: UseGameSessionProps) => {
    const { user } = useAuth();
    const [session, setSession] = useState<GameSessionExpanded | null>(null);
    const [nickname, setNickname] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [scores, setScores] = useState<SessionScore[]>([]);
    const [submittingScore, setSubmittingScore] = useState(false);
    const [canPlayAgain, setCanPlayAgain] = useState(true);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({
        isOpen: false,
        title: '',
        message: ''
    });

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

                        const gameCompletedState = localStorage.getItem(GAME_COMPLETED_KEY + sessionId);
                        if (gameCompletedState === 'true') {
                            setGameCompleted(true);
                        }

                        if (sessionData.max_attempts) {
                            const attempts = userScore.attempts || 1;
                            if (attempts >= sessionData.max_attempts) {
                                setCanPlayAgain(false);
                            }
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
            const updatedScore = await sessionService.submitScore(sessionId, nickname, score, timeInSeconds, user?.id);
            setGameCompleted(true);
            localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');

            const leaderboard = await sessionService.getLeaderboard(sessionId);
            setScores(leaderboard);

            if (session?.max_attempts) {
                const currentAttempts = updatedScore.attempts || 1;
                if (currentAttempts >= session.max_attempts) {
                    setCanPlayAgain(false);
                }
            }
        } catch (err: any) {
            console.error('Error submitting score:', err);

            if (err.message?.includes('límite')) {
                setAlertModal({
                    isOpen: true,
                    title: 'Límite Alcanzado',
                    message: err.message
                });
                setGameCompleted(true);
                localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');
                setCanPlayAgain(false);
            } else if (err.message?.includes('No superaste')) {
                setAlertModal({
                    isOpen: true,
                    title: 'Puntuación no superada',
                    message: err.message + '\n\nTu mejor puntuación se mantiene en el leaderboard.'
                });
                setGameCompleted(true);
                localStorage.setItem(GAME_COMPLETED_KEY + sessionId, 'true');
            } else {
                setAlertModal({
                    isOpen: true,
                    title: 'Error',
                    message: 'Error al enviar puntuación. Por favor intenta de nuevo.'
                });
            }
        } finally {
            setSubmittingScore(false);
        }
    };

    const closeAlertModal = () => setAlertModal({ ...alertModal, isOpen: false });

    const resetGame = () => {
        if (!sessionId) return;
        localStorage.removeItem(GAME_COMPLETED_KEY + sessionId);
        window.location.reload();
    };

    return {
        session,
        nickname,
        loading,
        error,
        gameCompleted,
        scores,
        alertModal,
        canPlayAgain,
        handleNicknameSubmit,
        handleGameComplete,
        closeAlertModal,
        resetGame,
        setGameCompleted // In case strict mode causes issues or external triggers needed
    };
};
