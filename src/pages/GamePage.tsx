import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { FlashCardGame } from '../components/FlashCardGame';
import { QuizGame } from '../components/QuizGame';
import { HangmanGame } from '../components/HangmanGame';
import { CreateSessionModal } from '../components/CreateSessionModal';
import { ArrowLeft } from 'lucide-react';
import { sessionService } from '../services/sessionService.js';

export const GamePage = () => {
    const { id } = useParams<{ id: string }>();
    const { games } = useContent();
    const game = games.find((g) => g.id === id);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCreateSession = async (title: string, durationHours: number, maxAttempts?: number): Promise<string> => {
        if (!game) throw new Error('Game not found');

        const session = await sessionService.createSession(game.id, title, durationHours, maxAttempts);
        return session.session_id;
    };

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
                    onShare={() => setIsModalOpen(true)}
                    onExit={() => window.history.back()}
                />
                <CreateSessionModal
                    game={game}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreateSession={handleCreateSession}
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
                    onShare={() => setIsModalOpen(true)}
                    onExit={() => window.history.back()}
                />
                <CreateSessionModal
                    game={game}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCreateSession={handleCreateSession}
                />
            </>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <Link to="/" className="btn btn-outline inline-flex mb-4">
                    <ArrowLeft size={16} /> Back to Games
                </Link>

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
        </div>
    );
};
