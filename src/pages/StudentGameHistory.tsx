import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, Trophy, Clock, AlertCircle, Timer } from 'lucide-react';
import { gameHistoryService } from '../features/games/services/gameHistoryService';
import type { GameHistory } from '../shared/types';

export const StudentGameHistory = () => {
    const { profile } = useAuth();
    const [history, setHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!profile?.id) return;
            try {
                const historyData = await gameHistoryService.getStudentHistory(profile.id);
                setHistory(historyData);
            } catch (err) {
                console.error("Failed to fetch history", err);
                setError("Could not load your game history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [profile?.id]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins === 0) return `${seconds}s`;
        const hours = Math.floor(mins / 60);
        if (hours === 0) return `${mins}m ${seconds % 60}s`;
        return `${hours}h ${mins % 60}m`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card max-w-2xl mx-auto text-center p-8">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-bold mb-2">Error Loading History</h2>
                <p className="text-slate-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Games History</h1>

            {history.length === 0 ? (
                <div className="glass-panel p-12 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
                    <div className="inline-flex size-16 rounded-full bg-slate-100 dark:bg-white/5 items-center justify-center mb-4 text-slate-400">
                        <Trophy size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No games played yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                        Your game history will appear here once you start playing!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((entry) => (
                        <div key={entry.id} className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    <Trophy size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                        {entry.game?.title || 'Unknown Game'}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>
                                                {new Date(entry.completed_at).toLocaleString(undefined, {
                                                    dateStyle: 'long'
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>
                                                {new Date(entry.completed_at).toLocaleString(undefined, {
                                                    timeStyle: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Time</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-end gap-1">
                                        <Timer size={14} /> {formatDuration(entry.time_seconds || 0)}
                                    </p>
                                </div>
                                <div className="text-right bg-slate-50 dark:bg-white/5 px-6 py-3 rounded-xl border border-slate-100 dark:border-white/5">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Score</p>
                                    <p className="text-2xl font-black text-primary">
                                        {entry.score} <span className="text-sm font-normal text-slate-400">/ {entry.max_score}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
