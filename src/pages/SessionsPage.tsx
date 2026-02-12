import { useEffect, useState } from 'react';
import { sessionService } from '../features/sessions/services/sessionService';
import type { GameSessionExpanded } from '../shared/types';
import { SessionLeaderboardModal } from '../features/sessions/components/SessionLeaderboardModal';
import { Link } from 'react-router-dom';

export const SessionsPage = () => {
    const [sessions, setSessions] = useState<GameSessionExpanded[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            const data = await sessionService.getUserSessions();
            setSessions(data);
            setLoading(false);
        };

        fetchSessions();
    }, []);

    const copySessionLink = (sessionId: string) => {
        const url = `${window.location.origin}/session/${sessionId}`;
        navigator.clipboard.writeText(url);
        // You might want to add a toast notification here
        alert('Link copied to clipboard!');
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="page-title">My Sessions</h1>
                    <p className="text-slate-500">
                        Manage your active game sessions and view leaderboards.
                    </p>
                </div>
                <Link
                    to="/admin"
                    className="btn btn-primary flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
                </div>
            ) : sessions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl text-gray-400">joystick</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active sessions</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Create a game session to share with your students or friends and track their scores.
                    </p>
                    <Link to="/admin" className="btn btn-outline">
                        Create your first session
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`card group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!sessionService.isSessionActive(session) ? 'opacity-75 grayscale-[0.5]' : ''}`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sessionService.isSessionActive(session)
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                        {sessionService.isSessionActive(session) ? 'Active' : 'Inactive'}
                                    </div>
                                    <div className="text-sm font-mono font-bold text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                                        {session.session_id}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1" title={session.title}>
                                    {session.title}
                                </h3>

                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                    <span className="material-symbols-outlined text-[18px]">sports_esports</span>
                                    <span className="truncate">{session.expand?.game?.title || 'Unknown Game'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSelectedSessionId(session.session_id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">leaderboard</span>
                                        Scores
                                    </button>
                                    <button
                                        onClick={() => copySessionLink(session.session_id)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                        Copy Link
                                    </button>
                                </div>
                            </div>

                            {/* Decorative gradient */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            )}

            <SessionLeaderboardModal
                sessionId={selectedSessionId || ''}
                isOpen={!!selectedSessionId}
                onClose={() => setSelectedSessionId(null)}
            />
        </div>
    );
};
