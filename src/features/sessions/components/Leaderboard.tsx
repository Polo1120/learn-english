
import { Trophy } from 'lucide-react';
import type { SessionScore } from '../../../shared/types';

interface LeaderboardProps {
    scores: SessionScore[];
    currentNickname: string | null;
}

export const Leaderboard = ({ scores, currentNickname }: LeaderboardProps) => {
    return (
        <aside className="w-full h-full hidden lg:block">
            <div className="glass-panel p-5 rounded-xl flex flex-col gap-4 sticky top-6 bg-white/50 dark:bg-card-bg/60 backdrop-blur-md border border-slate-300 dark:border-white/10 transition-colors duration-300">
                <div className="flex items-center justify-between pb-4 border-b border-slate-300 dark:border-white/10">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={20} />
                        Top Players
                    </h3>
                    <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-md">Live</span>
                </div>

                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                    {scores.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Waiting for scores...</p>
                    ) : (
                        scores.map((score, index) => {
                            const isCurrentUser = score.nickname === currentNickname;
                            const rank = index + 1;

                            // Top 1 Styling
                            if (rank === 1) {
                                return (
                                    <div key={score.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 shadow-sm relative overflow-hidden group hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                                        <div className="size-8 flex items-center justify-center text-2xl drop-shadow-sm">🥇</div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{score.nickname} {isCurrentUser && '(You)'}</span>
                                            <span className="text-xs text-yellow-600 dark:text-yellow-200/80">{score.score} pts</span>
                                        </div>
                                    </div>
                                );
                            }

                            // Standard styling
                            return (
                                <div key={score.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isCurrentUser ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 dark:border-primary/50' : 'bg-white/50 dark:bg-white/5 border-slate-300 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                                    <div className="size-8 flex items-center justify-center text-xl text-slate-500 dark:text-gray-300">
                                        {rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-sm font-bold text-slate-400 dark:text-gray-500">#{rank}</span>}
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className={`text-sm font-bold truncate ${isCurrentUser ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-gray-200'}`}>{score.nickname} {isCurrentUser && '(You)'}</span>
                                        <span className={`text-xs ${isCurrentUser ? 'text-blue-600 dark:text-blue-200' : 'text-slate-500 dark:text-gray-400'}`}>{score.score} pts</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </aside>
    );
};
