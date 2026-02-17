
import { useTheme } from '../../../context/ThemeContext';

interface SessionHeaderProps {
    sessionTitle?: string;
    sessionId?: string;
    nickname: string | null;
    participantsCount: number;
    bestScore: number;
}

export const SessionHeader = ({
    sessionTitle,
    sessionId,
    nickname,
    participantsCount,
    bestScore
}: SessionHeaderProps) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="relative z-20 w-full border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md transition-colors duration-300">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                {/* Left: Session Title */}
                <div className="flex items-center gap-4 min-w-0">
                    <div className="hidden sm:flex size-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
                        <span className="material-symbols-outlined">school</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-base sm:text-lg font-bold leading-tight truncate text-slate-900 dark:text-white">Session: {sessionTitle || 'Loading...'}</h2>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                            <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Live</span>
                            <span className="mx-1">•</span>
                            <span className="font-medium text-slate-700 dark:text-white">ID: {sessionId}</span>
                        </div>
                    </div>
                </div>

                {/* Center: Playing As (Desktop/Tablet) */}
                <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <div className="size-6 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                        {nickname?.substring(0, 2)}
                    </div>
                    <span className="text-sm font-medium text-slate-600 dark:text-gray-300">Playing as: <span className="text-slate-900 dark:text-white font-bold">{nickname}</span></span>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-3 sm:gap-6 text-sm">
                    <div className="flex  items-end sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-gray-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                            <span className="material-symbols-outlined text-[18px]">group</span>
                            <span className="font-bold text-slate-900 dark:text-white">{participantsCount}</span>
                            <span className="hidden sm:inline text-xs font-normal">participants</span>
                        </div>
                        {participantsCount > 0 && (
                            <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
                                <span className="material-symbols-outlined text-[18px]">emoji_events</span>
                                <span className="hidden sm:inline text-xs text-yellow-700 dark:text-yellow-200">Best:</span>
                                <span className="font-bold">{bestScore} pts</span>
                            </div>
                        )}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center size-9 ml-2 rounded-lg text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
