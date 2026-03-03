import { useEffect, useState } from 'react';
import { sessionService } from '../services/sessionService';
import type { SessionScore } from '../../../shared/types';

interface SessionLeaderboardModalProps {
    dbId: string; // The UUID 'id' from database
    code: string; // The 8-char 'session_id'
    isOpen: boolean;
    onClose: () => void;
}

export const SessionLeaderboardModal = ({ dbId, code, isOpen, onClose }: SessionLeaderboardModalProps) => {
    const [leaderboardState, setLeaderboardState] = useState<{
        scores: SessionScore[];
        loading: boolean;
    }>({
        scores: [],
        loading: true
    });
    const { scores, loading } = leaderboardState;

    useEffect(() => {
        if (!isOpen) return;

        const fetchScores = async () => {
            const data = await sessionService.getLeaderboard(code);
            setLeaderboardState({ scores: data, loading: false });
        };

        fetchScores();

        // Subscribe to real-time updates using the UUID
        const unsubscribe = sessionService.subscribeToLeaderboard(dbId, (newScore) => {
            setLeaderboardState((prevState) => {
                // Check if score already exists (update) or is new
                const index = prevState.scores.findIndex(s => s.id === newScore.id);
                let newScores;
                if (index >= 0) {
                    newScores = [...prevState.scores];
                    newScores[index] = newScore;
                } else {
                    newScores = [...prevState.scores, newScore];
                }

                // Re-sort
                const sortedScores = newScores.sort((a, b) => {
                    if (a.score !== b.score) return b.score - a.score;
                    return (a.time_taken || 0) - (b.time_taken || 0);
                });
                return { ...prevState, scores: sortedScores };
            });
        });

        return () => {
            unsubscribe();
        };
    }, [dbId, code, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card-bg w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Session Leaderboard
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <span className="mb-2 text-4xl material-symbols-outlined animate-spin">refresh</span>
                            <p>Loading scores...</p>
                        </div>
                    ) : scores.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <span className="mb-4 text-6xl material-symbols-outlined opacity-20">leaderboard</span>
                            <p className="text-center">No scores yet.<br />Share the session code to get started!</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-gray-800">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3 w-16 text-center">#</th>
                                        <th className="px-4 py-3">Player</th>
                                        <th className="px-4 py-3 text-right">Score</th>
                                        <th className="px-4 py-3 text-right">Time</th>
                                        <th className="px-4 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {scores.map((score, index) => (
                                        <tr
                                            key={score.id}
                                            className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-center font-medium text-gray-400">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                                {score.nickname}
                                                {index === 0 && (
                                                    <span className="ml-2 inline-flex text-amber-400" title="Winner">
                                                        <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-primary">
                                                {score.score}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">
                                                {score.time_taken ? `${score.time_taken}s` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 text-xs">
                                                {new Date(score.completed_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800 rounded-b-xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
