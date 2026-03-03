
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../shared/components/ConfirmationModal';
import { NicknameEntry } from '../features/sessions/components/NicknameEntry';
import { QuizGame } from '../features/games/components/QuizGame';
import { WordImageGame } from '../features/games/components/WordImageGame';
import { MazeGame } from '../features/games/components/MazeGame';
import { useGameSession } from '../features/sessions/hooks/useGameSession';
import { Leaderboard } from '../features/sessions/components/Leaderboard';
import { CelebrationCard } from '../features/sessions/components/CelebrationCard';
import { SessionHeader } from '../features/sessions/components/SessionHeader';
import { SessionLoading, SessionError } from '../features/sessions/components/SessionLoadingErrors';

export const PublicGameSession = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const {
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
        submittingScore
    } = useGameSession({ sessionId });

    if (loading) return <SessionLoading />;
    if (error || !session) return <SessionError error={error} />;

    // NICKNAME ENTRY
    if (!nickname) {
        return <NicknameEntry onSubmit={handleNicknameSubmit} sessionTitle={session.title} />;
    }

    // COMPLETED STATE
    if (gameCompleted) {
        return (
            <CelebrationCard
                sessionId={sessionId!}
                sessionTitle={session.title}
                nickname={nickname}
                scores={scores}
                canPlayAgain={canPlayAgain}
                onShare={() => {
                    navigator.share?.({
                        title: session.title,
                        text: 'Join this game session!',
                        url: window.location.href,
                    });
                }}
                onPlayAgain={resetGame}
                alertModal={{
                    ...alertModal,
                    onClose: closeAlertModal
                }}
            />
        );
    }

    const game = session.expand?.game;
    if (!game) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card max-w-md text-center">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h2 className="text-2xl font-bold mb-2">Error</h2>
                    <p className="text-slate-600">Could not load the game</p>
                </div>
            </div>
        );
    }

    // GAMEPLAY STATE
    const isQuiz = game?.type === 'quiz';
    const isWordImage = game?.type === 'word_image';
    const isMazeGame = game?.type === 'maze_game';
    const bestScore = Math.max(...scores.map(s => s.score), 0);

    return (
        <div className="bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white font-display min-h-screen flex flex-col relative overflow-x-hidden selection:bg-primary selection:text-white transition-colors duration-300">
            {/* Vibrant Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <SessionHeader
                sessionTitle={session.title}
                sessionId={sessionId}
                nickname={nickname}
                participantsCount={scores.length}
                bestScore={bestScore}
            />

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-start p-4 md:p-6 lg:p-8 w-full max-w-[1440px] mx-auto">
                <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start h-full">

                    {/* Game Column */}
                    <div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto lg:mx-0">
                        {isQuiz && game.content.questions && (
                            <QuizGame
                                questions={game.content.questions}
                                showOptionLabels={game.content.quizOptionDisplayMode === 'with_labels'}
                                onGameComplete={handleGameComplete}
                                isSubmitting={submittingScore}
                            />
                        )}
                        {isWordImage && game.content.words && (
                            <WordImageGame
                                words={game.content.words}
                                onGameComplete={handleGameComplete}
                                isSubmitting={submittingScore}
                            />
                        )}
                        {isMazeGame && game.content.questions && (
                            <MazeGame
                                questions={game.content.questions}
                                onGameComplete={handleGameComplete}
                            />
                        )}
                        {!isQuiz && !isWordImage && !isMazeGame && (
                            <div className="glass-panel text-slate-900 dark:text-gray-400 p-8 text-center bg-white/50 dark:bg-white/5">
                                Game type not supported in this view.
                            </div>
                        )}
                    </div>

                    {/* Leaderboard Sidebar */}
                    <Leaderboard scores={scores} currentNickname={nickname} />

                </div>
            </main>

            
            <ConfirmationModal
                isOpen={alertModal.isOpen}
                onClose={closeAlertModal}
                onConfirm={closeAlertModal}
                title={alertModal.title}
                message={alertModal.message}
                confirmText="Got it"
                variant="primary"
                cancelText="Close"
            />
        </div>
    );
};
