import { Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { Loader2, AlertCircle } from 'lucide-react';

export const Home = () => {
    const { games, deleteGame, loading, error } = useContent();

    const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
        e.preventDefault();
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deleteGame(id);
            } catch (err) {
                alert('Failed to delete game. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <span className="ml-4 text-slate-500">Loading games...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card max-w-2xl mx-auto text-center p-8">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Error Loading Games</h2>
                <p className="text-slate-500 mb-4">{error}</p>
                <p className="text-sm text-slate-400">
                    Make sure Supabase is configured correctly in your environment variables.
                </p>
            </div>
        );
    }

    // Helper to get image based on game type (using the URLs from the user's design)
    const getGameImage = (type: string) => {
        switch (type) {
            case 'quiz':
                return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxG3-meDnQZPvsbIIUsSURUb5nNH5awpjDuDXrGRPeLmRfWrMl8b-jKgEQnPaATLKKjpKZHM4qxoePGJxspR-tR-ATw-OrMmCOx-12wwVh5Ljz-HHUkQ_CMBpcxmVtgVRQADulVtvJeFQoOb1m5ZU8Xhhhu-hCH-IMRGeEnlhxfmpQVOZkIav4RyX1aADFk9k59x1eOjQ4A9csHeK80TOonESpCuGCQtGTiCMszMbe0QYD5pDugN4njDw1SJ2BASRlgakmLG1tkk0';
            case 'hangman':
                return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhEH3Tu7lEnWvApN1MW-89IlAVKCC5PjtmgcgMrri42PxHJVSNXAYCYjzvepRnxtgNYWtnUCVSNclME3qA9aRwxDkvUiOib22ibpz4L_Ps7VrXAWyy0ZhtE74grKXIHgkPE8hQOxHZy6Mi4_gnb2GzCGn1jgXggbYbIlDhzoZq9_3zQxeSalb4QQmp8FPMa8aE6PebVziqOorMT7Xt0Uou4nqN68IsY5w21pJukXLvCyvUhs3PlmV_yeJ5xI8K2wrPN0Qb0jbU1Mo';
            case 'flashcard':
                return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmAvLgLll1HVpfec7X8kNSY1q9N5OV0kD5xuUUQfAVSd5UrI3XrnVnwy6P9PTez4nHrxQNWYvuOxOZsntcac0rH1oBBj1BWtQMA9-PzBQOXPr6GZGeZhwkuK0vWtKYZYUPGyxLM7TutUx4hnJmYChnWui8wXflRvXFbLCN1DCKFsKJLMKkiiX-Qr-8zuYtSlllXdeBrembjxvk-GRx5zxqthJBgYVWzn6ImWK9CXTBmukHo3uRzEqnGrdRtLEvvcId2q_MGKXWKRs';
            default:
                return 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3ZNI7AuVnQ9YfwFvSXOshZfqTv5ZN4kzmsXUt7xXi6Tx49GuXW1AuQBMVc4pIYFUb5vlxUB-UUaps1tbiU4iNeztYD7W5r0cJH6Bc8HgSSDl4URp10pGGIAKLMaDTvAPfy2OXsmxMECuKpTaYBRbBwVrFwDZPVhS7qSsIRnaV9vSRnRPmHGPd_65oTYWnE1sR3w5lWyrCYjAms2Lj1BojQwK2W1AaUGH9YfUVDzPn9QWNOeKsFy8K-iLzW70PlrkSqKsXi-0L6_E';
        }
    };

    const getBadgeColor = (type: string) => {
        switch (type) {
            case 'quiz': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
            case 'hangman': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
            case 'flashcard': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'quiz': return 'quiz';
            case 'hangman': return 'videogame_asset';
            case 'flashcard': return 'style';
            default: return 'gamepad';
        }
    };

    return (
        <div>
            {/* Page Heading */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111318] dark:text-white">
                    Available Learning Games
                </h1>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                    <div key={game.id} className="group bg-white dark:bg-[#1A2230] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">

                        {/* Card Image Header */}
                        <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${getGameImage(game.type)}')` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                            <div className="absolute top-4 left-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${getBadgeColor(game.type)}`}>
                                    {game.type}
                                </span>
                            </div>

                            <div className="absolute bottom-4 left-4 text-white">
                                <span className="material-symbols-outlined text-3xl mb-1">{getIcon(game.type)}</span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-2 group-hover:text-primary transition-colors">
                                {game.title}
                            </h3>
                            <p className="text-[#637588] dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                                {game.description}
                            </p>

                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <Link to={`/game/${game.id}`} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white h-9 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                                    Play Now
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                                <button
                                    onClick={(e) => handleDelete(e, game.id, game.title)}
                                    className="flex items-center justify-center size-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete Game"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Create New Game Card (Always shown at the end) */}
                <Link to="/admin" className="group flex flex-col items-center justify-center min-h-[350px] bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                    <div className="size-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl text-primary">add</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-1">Create New Game</h3>
                    <p className="text-[#637588] dark:text-gray-400 text-sm text-center px-6">
                        Add a new quiz, hangman, or flashcard set.
                    </p>
                </Link>
            </div>
        </div>
    );
};
