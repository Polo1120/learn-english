import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { FlashCardGame } from '../features/games/components/FlashCardGame';
import { QuizGame } from '../features/games/components/QuizGame';
import { HangmanGame } from '../features/games/components/HangmanGame';
import { CreateSessionModal } from '../features/sessions/components/CreateSessionModal';
import { AssignGameModal } from '../features/assignments/components/AssignGameModal';
import { gameHistoryService } from '../features/games/services/gameHistoryService';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
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

    const game = gameFromContext || fetchedGame;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const { profile } = useAuth(); // Get profile to check role

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
            // Run history save and assignment mark in parallel for speed
            await Promise.all([
                gameHistoryService.saveGameHistory({
                    student_id: profile.id,
                    game_id: game.id,
                    assignment_id: assignmentId,
                    score: score,
                    max_score: game.type === 'quiz' ? game.content.questions?.length || 0 :
                        game.type === 'hangman' ? game.content.words?.length || 0 : 0,
                    time_seconds: timeInSeconds,
                }),
                assignmentService.markAsCompleted(assignmentId)
            ]);

            // Faster transition (1s is enough for the user to see success)
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Error completing assignment:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="animate-spin text-primary" size={48} />
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

    // Special full-screen layout for HangmanGame
    if (game.type === 'hangman' && game.content.words) {
        return (
            <>
                <HangmanGame
                    words={game.content.words}
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
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <Link to="/" className="btn btn-outline inline-flex">
                        <ArrowLeft size={16} /> Back to Games
                    </Link>

                    {/* Only teachers can assign games */}
                    {profile?.role === 'teacher' && (
                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="btn btn-secondary flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            Assign to Student
                        </button>
                    )}
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        {/* Header content removed by user preference */}
                    </div>
                </div>
            </div>

            {game.type === 'flashcard' && game.content.cards && (
                <FlashCardGame cards={game.content.cards} />
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
