import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { useProfile } from '../features/profile/hooks/useProfile';
import { StudentDashboard } from './StudentDashboard';
import { Loader2, AlertCircle } from 'lucide-react';
import { ConfirmationModal } from '../shared/components/ConfirmationModal';
import { GameCard } from '../features/games/components/GameCard';
import { CreateGameCard } from '../features/games/components/CreateGameCard';

export const Home = () => {
    const { games, deleteGame, loading: contentLoading, error: contentError } = useContent();
    const { profile, loading: profileLoading } = useProfile();
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; gameId: string | null; title: string }>({
        isOpen: false,
        gameId: null,
        title: ''
    });

    const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
        e.preventDefault();
        setDeleteModal({ isOpen: true, gameId: id, title });
    };

    const confirmDelete = async () => {
        if (deleteModal.gameId) {
            try {
                await deleteGame(deleteModal.gameId);
            } catch {
                console.error('Delete failed');
            } finally {
                setDeleteModal((prev) => ({ ...prev, isOpen: false }));
            }
        }
    };

    if (profileLoading || contentLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <span className="ml-4 text-slate-500">Loading...</span>
            </div>
        );
    }

    if (profile?.role === 'student') {
        return <StudentDashboard />;
    }

    if (contentError) {
        return (
            <div className="card max-w-2xl mx-auto text-center p-8">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Error Loading Games</h2>
                <p className="text-slate-500 mb-4">{contentError}</p>
                <p className="text-sm text-slate-400">
                    Make sure Supabase is configured correctly.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111318] dark:text-white">
                    Available Learning Games
                </h1>
                <Link
                    to="/admin"
                    className="md:hidden flex items-center justify-center gap-2 bg-primary text-white h-10 px-4 rounded-lg font-bold shadow-lg shadow-primary/20"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Create Game
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <GameCard key={game.id} game={game} onDelete={handleDeleteClick} />
                ))}
                <CreateGameCard />
            </div>

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title="Delete Game"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};
