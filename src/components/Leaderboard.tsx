import { useEffect, useState } from 'react';
import { Trophy, Clock, Medal } from 'lucide-react';
import type { SessionScore } from '../types';

interface LeaderboardProps {
    scores: SessionScore[];
    currentNickname?: string;
    isRealtime?: boolean;
}

export const Leaderboard = ({ scores, currentNickname, isRealtime = false }: LeaderboardProps) => {
    const [animatedScores, setAnimatedScores] = useState<SessionScore[]>(scores);

    useEffect(() => {
        setAnimatedScores(scores);
    }, [scores]);

    const formatTime = (seconds?: number) => {
        if (!seconds) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMedalIcon = (position: number) => {
        switch (position) {
            case 1:
                return <Trophy className="text-yellow-500" size={20} />;
            case 2:
                return <Medal className="text-slate-400" size={20} />;
            case 3:
                return <Medal className="text-amber-600" size={20} />;
            default:
                return null;
        }
    };

    if (scores.length === 0) {
        return (
            <div className="card text-center py-12">
                <Trophy className="mx-auto mb-4 text-slate-300" size={48} />
                <h3 className="text-xl font-semibold mb-2">Sin puntuaciones aún</h3>
                <p className="text-slate-500">
                    Sé el primero en completar el juego y aparecer en la tabla de posiciones
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={28} />
                    Tabla de Posiciones
                </h2>
                {isRealtime && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        En vivo
                    </div>
                )}
            </div>

            <div className="space-y-2">
                {animatedScores.map((score, index) => {
                    const position = index + 1;
                    const isCurrentUser = score.nickname === currentNickname;

                    return (
                        <div
                            key={score.id}
                            className={`
                                p-4 rounded-lg border-2 transition-all duration-300
                                ${isCurrentUser
                                    ? 'bg-indigo-50 border-indigo-300 shadow-md'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }
                                ${position <= 3 ? 'shadow-sm' : ''}
                            `}
                        >
                            <div className="flex items-center gap-4">

                                <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                                    {getMedalIcon(position) || (
                                        <span className="text-2xl font-bold text-slate-400">
                                            {position}
                                        </span>
                                    )}
                                </div>


                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-semibold truncate ${isCurrentUser ? 'text-indigo-700' : 'text-slate-800'
                                            }`}>
                                            {score.nickname}
                                        </p>
                                        {isCurrentUser && (
                                            <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                                                Tú
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {formatTime(score.time_taken)}
                                        </span>
                                        <span className="text-xs">
                                            {new Date(score.completed_at).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>


                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${isCurrentUser ? 'text-indigo-600' : 'text-slate-800'
                                        }`}>
                                        {score.score}
                                    </div>
                                    <div className="text-xs text-slate-500">puntos</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {scores.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex justify-between gap-4 text-center text-sm">
                        <div>
                            <p className="text-slate-500">Participantes</p>
                            <p className="text-xl font-bold text-slate-800">{scores.length}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Mejor Score</p>
                            <p className="text-xl font-bold text-yellow-600">
                                {Math.max(...scores.map(s => s.score))}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Promedio</p>
                            <p className="text-xl font-bold text-indigo-600">
                                {Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
