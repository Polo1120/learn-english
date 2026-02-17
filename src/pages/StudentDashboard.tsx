import { useEffect, useState } from 'react';
import { useProfile } from '../features/profile/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Trophy, Clock, Star, Gamepad2, Timer } from 'lucide-react';
import { gameHistoryService } from '../features/games/services/gameHistoryService';

export const StudentDashboard = () => {
    const { profile } = useProfile();
    const [stats, setStats] = useState({
        totalGames: 0,
        totalScore: 0,
        averageScore: 0,
        totalTime: 0
    });
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!profile?.id) return;

        const loadDashboardData = async () => {
            try {
                const [statsData, historyData] = await Promise.all([
                    gameHistoryService.getStudentStats(profile.id),
                    gameHistoryService.getStudentHistory(profile.id)
                ]);
                setStats(statsData);
                setHistory(historyData);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [profile?.id]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins === 0) return `${seconds}s`;
        const hours = Math.floor(mins / 60);
        if (hours === 0) return `${mins}m ${seconds % 60}s`;
        return `${hours}h ${mins % 60}m`;
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="page-title">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{profile?.full_name?.split(' ')[0] || 'Student'}</span>! 👋
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Ready to learn something new today?
                    </p>
                </div>
            </div>

            <AssignmentsSection studentId={profile?.id} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6">
                        <Trophy size={64} className="text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Score</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalScore}</h3>
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6">
                        <Star size={64} className="text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Games Played</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.totalGames}</h3>
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-6">
                        <Clock size={64} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time Spent</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">{formatDuration(stats.totalTime)}</h3>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="text-primary" size={24} />
                        Recent Activity
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-12 opacity-50">Loading activity...</div>
                ) : history.length === 0 ? (
                    <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
                        <div className="inline-flex size-16 rounded-full bg-slate-100 dark:bg-white/5 items-center justify-center mb-4 text-slate-400">
                            <Gamepad2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No activity yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2">
                            Join a game session to start tracking your progress and earning badges!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.slice(0, 5).map((entry) => (
                            <div key={entry.id} className="p-4 rounded-xl border dark:border-white/5 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                        <Trophy size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">{entry.game?.title || 'Unknown Game'}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(entry.completed_at).toLocaleString(undefined, {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-6">
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Time</p>
                                        <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                            <Timer size={14} /> {formatDuration(entry.time_seconds || 0)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-lg">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Score</p>
                                        <p className="text-lg font-black text-primary">
                                            {entry.score} <span className="text-sm font-normal text-slate-400">/ {entry.max_score}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-component for Assignments to avoid massive file changes in one go and keep it clean
import { assignmentService } from '../features/assignments/services/assignmentService';
import { ClipboardList, ChevronRight } from 'lucide-react';

const AssignmentsSection = ({ studentId }: { studentId?: string }) => {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!studentId) return;
        const load = async () => {
            try {
                const data = await assignmentService.getPendingAssignments(studentId);
                setAssignments(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [studentId]);

    if (!studentId) return null;

    return (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <ClipboardList className="text-primary" size={24} />
                My Assignments
            </h2>

            {loading ? (
                <div className="text-center py-8 opacity-50">Loading assignments...</div>
            ) : assignments.length === 0 ? (
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
                    <p className="text-slate-500">No pending assignments! 🎉</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                        <div key={assignment.id} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col">
                            <h3 className="font-bold text-lg mb-2">{assignment.game?.title || 'Unknown Game'}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{assignment.game?.description}</p>
                            <Link
                                to={`/game/${assignment.game_id}?assignmentId=${assignment.id}`}
                                className="mt-auto btn btn-primary flex justify-center items-center gap-2"
                            >
                                Play Now <ChevronRight size={16} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
