
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';
import type { SessionScore } from '../../../shared/types';

interface CelebrationCardProps {
    sessionId: string;
    sessionTitle: string;
    nickname: string | null;
    scores: SessionScore[];
    canPlayAgain: boolean;
    onShare: () => void;
    onPlayAgain: () => void;
    alertModal: {
        isOpen: boolean;
        title: string;
        message: string;
        onClose: () => void;
    };
}

export const CelebrationCard = ({
    sessionId,
    nickname,
    scores,
    canPlayAgain,
    onShare,
    onPlayAgain,
    alertModal
}: CelebrationCardProps) => {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark overflow-x-hidden font-display">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]"></div>
            </div>

            <div className="relative z-10 layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#282e39] px-4 py-3 lg:px-10 glass-panel sticky top-0 z-50">
                    <div className="flex items-center gap-4 text-white">
                        <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
                            <span className="material-symbols-outlined text-xl">school</span>
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">English Quest</h2>
                    </div>
                    {/* Live Indicator */}
                    <div className="hidden sm:flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-red-400 text-xs font-bold tracking-wider">LIVE SESSION #{sessionId}</span>
                    </div>
                </header>

                <main className="flex flex-1 justify-center py-5 px-4 md:px-10 lg:px-40">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-8">
                        {/* Mobile Live Indicator */}
                        <div className="flex sm:hidden justify-center items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <p className="text-red-400 text-xs font-bold tracking-widest">LIVE SESSION #{sessionId}</p>
                        </div>

                        {/* Celebration Card */}
                        <div className="glass-panel rounded-2xl p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center justify-between animate-fade-in-up">
                            {/* Trophy Image */}
                            <div className="w-full max-w-[280px] md:w-1/3 flex justify-center">
                                <div className="relative w-48 h-48 md:w-56 md:h-56">
                                    {/* Glow effect behind trophy */}
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-[40px] rounded-full"></div>
                                    <img
                                        alt="Golden Trophy"
                                        className="relative w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_x-xoK6KFQ2y9ujcXAqvl1ucSNdJo2xR8S2P96gx4X15u7hfEzsJDPARwafb9_uGmBkWxwztzCKmdM7OuBEFYjMJGw83Asnj8a8bWjXBW330iDuQJBGfWehVH1ykHKzLVciQwn248x0Wrdskm4fg2m4DJiLmIhNF4Bo9OqSsW6-LwtJEWyEZ6U9dc_0EjHsL4xanhnuvpnsd5QR8yZsViTuXiL4m-TY7pR_q4Q-m6At3OXNbRrzBHuIDLIjJbvTpnwYEi3RjxnXs"
                                    />
                                </div>
                            </div>
                            {/* Text Content */}
                            <div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left flex-1">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em] bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                        ¡Juego Completado!
                                    </h1>
                                    <h2 className="text-gray-300 text-lg font-medium leading-normal">
                                        Gracias por participar, <span className="text-white font-bold">{nickname}</span>.
                                    </h2>
                                    {!canPlayAgain && (
                                        <p className="text-yellow-500/90 text-sm font-medium bg-yellow-500/10 px-3 py-1 rounded-lg w-fit mx-auto md:mx-0 mt-2 border border-yellow-500/20">
                                            ⚠️ Has alcanzado el límite de intentos
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 justify-center md:justify-start w-full">
                                    <button
                                        onClick={onShare}
                                        className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(19,91,236,0.4)] text-white text-base font-bold leading-normal tracking-[0.015em]"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">share</span>
                                        <span className="truncate">Compartir</span>
                                    </button>
                                    {canPlayAgain && (
                                        <button
                                            onClick={onPlayAgain}
                                            className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full h-12 px-6 bg-transparent border border-gray-600 hover:bg-white/5 transition-all text-white text-base font-bold leading-normal tracking-[0.015em]"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">replay</span>
                                            <span className="truncate">Jugar de Nuevo</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Leaderboard Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">Tabla de Clasificación</h2>
                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">schedule</span> En vivo
                                </div>
                            </div>
                            <div className="glass-panel rounded-xl overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#1c1f27]/50 border-b border-white/5 text-gray-400 text-sm font-medium uppercase tracking-wider">
                                            <th className="px-6 py-4 w-24">Posición</th>
                                            <th className="px-6 py-4">Nickname</th>
                                            <th className="px-6 py-4 text-right">Puntuación</th>
                                            <th className="px-6 py-4 text-right hidden sm:table-cell">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {scores.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                    Esperando puntuaciones...
                                                </td>
                                            </tr>
                                        ) : (
                                            scores.map((score, index) => {
                                                const isCurrentUser = score.nickname === nickname;
                                                const rank = index + 1;
                                                const medalEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                                                const initials = score.nickname.substring(0, 2).toUpperCase();
                                                const formatTime = (seconds?: number) => {
                                                    if (!seconds) return '--:--';
                                                    const mins = Math.floor(seconds / 60);
                                                    const secs = seconds % 60;
                                                    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                                                };

                                                return (
                                                    <tr
                                                        key={score.id}
                                                        className={`hover:bg-white/5 transition-colors ${isCurrentUser ? 'bg-primary/20 border-l-4 border-l-primary shadow-[inset_0_0_20px_rgba(19,91,236,0.1)]' : ''}`}
                                                    >
                                                        <td className="px-6 py-4 text-white font-bold text-lg">
                                                            <div className="flex items-center gap-2">
                                                                {medalEmoji && <span className="text-2xl">{medalEmoji}</span>}
                                                                {rank}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser
                                                                    ? 'bg-primary text-white shadow-lg'
                                                                    : rank === 1
                                                                        ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-500'
                                                                        : rank === 2
                                                                            ? 'bg-gray-400/20 border border-gray-400/40 text-gray-300'
                                                                            : rank === 3
                                                                                ? 'bg-orange-700/20 border border-orange-700/40 text-orange-400'
                                                                                : 'bg-slate-700 text-slate-300'
                                                                    }`}>
                                                                    {initials}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`font-medium ${isCurrentUser ? 'text-white font-bold text-lg' : 'text-white'}`}>
                                                                        {score.nickname} {isCurrentUser && '(Tú)'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className={`font-bold ${isCurrentUser
                                                                ? 'text-primary text-2xl drop-shadow-[0_0_10px_rgba(19,91,236,0.5)]'
                                                                : rank === 1
                                                                    ? 'text-yellow-400 text-xl drop-shadow-sm'
                                                                    : rank === 2
                                                                        ? 'text-gray-300 text-xl'
                                                                        : rank === 3
                                                                            ? 'text-orange-400 text-xl'
                                                                            : 'text-gray-400 text-lg'
                                                                }`}>
                                                                {score.score}
                                                            </span> pts
                                                        </td>
                                                        <td className={`px-6 py-4 text-right font-mono hidden sm:table-cell ${isCurrentUser ? 'text-gray-300' : 'text-gray-400'}`}>
                                                            {formatTime(score.time_taken)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* Alert Modal */}
            <ConfirmationModal
                isOpen={alertModal.isOpen}
                onClose={alertModal.onClose}
                onConfirm={alertModal.onClose}
                title={alertModal.title}
                message={alertModal.message}
                confirmText="Entendido"
                variant="primary"
                cancelText="Cerrar"
            />
        </div>
    );
};
