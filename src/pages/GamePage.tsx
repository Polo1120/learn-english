import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { FlashCardGame } from '../features/games/components/FlashCardGame';
import { QuizGame } from '../features/games/components/QuizGame';
import { WordImageGame } from '../features/games/components/WordImageGame';
import { MazeGame } from '../features/games/components/MazeGame';
import { CreateSessionModal } from '../features/sessions/components/CreateSessionModal';
import { AssignGameModal } from '../features/assignments/components/AssignGameModal';
import { gameHistoryService } from '../features/games/services/gameHistoryService';
import { Loader2 } from 'lucide-react';
import { sessionService } from '../features/sessions/services/sessionService';
import { useAuth } from '../context/AuthContext';
import { assignmentService } from '../features/assignments/services/assignmentService';
import { gamesService } from '../features/games/services/gamesService';
import type { Game } from '../shared/types';

export const GamePage = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const assignmentId = searchParams.get('assignmentId');
    const { games } = useContent();
    const gameFromContext = games.find((g) => g.id === id);

    const [fetchedGame, setFetchedGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const [completingAssignment, setCompletingAssignment] = useState(false);

    const game = gameFromContext || fetchedGame;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const { profile } = useAuth();

    useEffect(() => {
        const fetchGame = async () => {
            if (!gameFromContext && id) {
                setLoading(true);
                try {
                    const data = await gamesService.getOne(id);
                    if (data) {
                        setFetchedGame(data);
                    } else {
                        console.error('Game not found');
                    }
                } catch (err) {
                    console.error('Error fetching game:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (!gameFromContext) {
            fetchGame();
        }
    }, [id, gameFromContext]);

    const handleCreateSession = async (title: string, durationHours: number, maxAttempts?: number): Promise<string> => {
        if (!game) throw new Error('Game not found');

        const session = await sessionService.createSession(game.id, title, durationHours, maxAttempts);
        return session.session_id;
    };

    const handleAssignmentComplete = async (score: number, timeInSeconds: number) => {
        if (!assignmentId || !profile?.id || !game) return;

        try {
            setCompletingAssignment(true);
            // Run history save and assignment mark in parallel for speed
            await Promise.all([
                gameHistoryService.saveGameHistory({
                    student_id: profile.id,
                    game_id: game.id,
                    assignment_id: assignmentId,
                    score: score,
                    max_score: game.type === 'quiz' ? game.content.questions?.length || 0 :
                        game.type === 'word_image' ? game.content.words?.length || 0 : 0,
                    time_seconds: timeInSeconds,
                }),
                assignmentService.markAsCompleted(assignmentId)
            ]);

            // Faster transition (0.5s is enough for the user to see success)
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (error) {
            console.error('Error completing assignment:', error);
            setCompletingAssignment(false);
        }
    };

    if (loading || completingAssignment) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                {completingAssignment && (
                    <div className="text-center">
                        <h3 className="text-xl font-bold">Guardando resultados...</h3>
                        <p className="text-slate-500">Tu progreso se está guardando de forma segura.</p>
                    </div>
                )}
            </div>
        );
    }


    if (!game) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-4">Game not found</h2>
                <Link to="/" className="btn btn-primary">
                    Back to Home
                </Link>
            </div>
        );
    }

    // Special full-screen layout for QuizGame
    if (game.type === 'quiz' && game.content.questions) {
        return (
            <>
                <QuizGame
                    questions={game.content.questions}
                    onGameComplete={assignmentId ? handleAssignmentComplete : undefined}
                    onShare={profile?.role === 'teacher' ? () => setIsModalOpen(true) : undefined}
                    onExit={() => window.history.back()}
                    onAssign={profile?.role === 'teacher' ? () => setIsAssignModalOpen(true) : undefined}
                    isSubmitting={completingAssignment}
                />
                <CreateSessionModal
                    game={game}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreateSession={handleCreateSession}
                />
                <AssignGameModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    gameId={game.id}
                    gameTitle={game.title}
                />
            </>
        );
    }

    // Special full-screen layout for WordImageGame
    if (game.type === 'word_image' && game.content.words) {
        return (
            <>
                <WordImageGame
                    words={game.content.words}
                    onGameComplete={assignmentId ? handleAssignmentComplete : undefined}
                    onShare={profile?.role === 'teacher' ? () => setIsModalOpen(true) : undefined}
                    onExit={() => window.history.back()}
                    onAssign={profile?.role === 'teacher' ? () => setIsAssignModalOpen(true) : undefined}
                    isSubmitting={completingAssignment}
                />
                <CreateSessionModal
                    game={game}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreateSession={handleCreateSession}
                />
                <AssignGameModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    gameId={game.id}
                    gameTitle={game.title}
                />
            </>
        );
    }

    // Special full-screen layout for MazeGame
    if (game.type === 'maze_game' && game.content.questions) {
        return (
            <>
                <MazeGame
                    questions={game.content.questions}
                    onGameComplete={assignmentId ? handleAssignmentComplete : undefined}
                    onShare={profile?.role === 'teacher' ? () => setIsModalOpen(true) : undefined}
                    onExit={() => window.history.back()}
                    onAssign={profile?.role === 'teacher' ? () => setIsAssignModalOpen(true) : undefined}
                />
                <CreateSessionModal
                    game={game}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreateSession={handleCreateSession}
                />
                <AssignGameModal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    gameId={game.id}
                    gameTitle={game.title}
                />
            </>
        );
    }

    return (
        <div>

            {game.type === 'flashcard' && game.content.cards && (
                <FlashCardGame
                    cards={game.content.cards}
                    onGameComplete={assignmentId ? handleAssignmentComplete : undefined}
                    isSubmitting={completingAssignment}
                    onExit={() => window.history.back()}
                    onShare={profile?.role === 'teacher' ? () => setIsModalOpen(true) : undefined}
                    onAssign={profile?.role === 'teacher' ? () => setIsAssignModalOpen(true) : undefined}
                />
            )}

            <CreateSessionModal
                game={game}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreateSession={handleCreateSession}
            />

            <AssignGameModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                gameId={game.id}
                gameTitle={game.title}
            />
        </div>
    );
};
