import { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

interface NicknameEntryProps {
    onSubmit: (nickname: string) => void;
    sessionTitle: string;
}

export const NicknameEntry = ({ onSubmit, sessionTitle }: NicknameEntryProps) => {
    const { theme, toggleTheme } = useTheme();
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedNickname = nickname.trim();

        // Validation
        if (trimmedNickname.length < 3) {
            setError('The nickname must have at least 3 characters');
            return;
        }

        if (trimmedNickname.length > 20) {
            setError('The nickname cannot have more than 20 characters');
            return;
        }

        // Only allow alphanumeric and spaces
        if (!/^[a-zA-Z0-9\s]+$/.test(trimmedNickname)) {
            setError('Only letters, numbers and spaces are allowed');
            return;
        }

        onSubmit(trimmedNickname);
    };

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-text-main dark:text-white font-display flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-[#020617] transition-colors duration-300"></div>
                {/* Noise overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay brightness-100 contrast-150 dark:mix-blend-overlay dark:opacity-20"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 dark:bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 dark:bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 z-20 p-2 rounded-full text-text-sub dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <span className="material-symbols-outlined text-[24px]">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
            </button>

            <div className="glass-card dark:bg-white/5 max-w-md w-full relative z-10 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none backdrop-blur-xl border border-white/80 dark:border-white/10 transition-all duration-300 rounded-2xl">
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-4xl">sports_esports</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tight text-text-main dark:text-white">
                        {sessionTitle}
                    </h1>
                    <p className="text-text-sub dark:text-gray-400">
                        Enter your nickname to join the session
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-bold mb-2 text-slate-700 dark:text-gray-300">
                            Your Nickname
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400 dark:text-gray-500">badge</span>
                            </div>
                            <input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => {
                                    setNickname(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ex: EagleEye, FastLearner..."
                                className="w-full pl-11 pr-4 py-3 bg-[rgba(241,245,249,0.5)] dark:bg-white/5 border border-[rgba(148,163,184,0.4)] dark:border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white dark:focus:bg-white/10 outline-none transition-all text-text-main dark:text-white placeholder-slate-400 dark:placeholder-gray-500"
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="text-xs text-text-sub dark:text-gray-500">
                                3-20 characters
                            </p>
                            <p className="text-xs text-text-sub dark:text-gray-500">
                                Letters and numbers
                            </p>
                        </div>

                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                            <X size={20} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-600 dark:text-red-200 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-emerald-500/30 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        disabled={nickname.trim().length < 3}
                    >
                        <span>Join the Game</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-300 dark:border-white/10 text-center">
                    <p className="text-xs text-text-sub dark:text-gray-500 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Your nickname must be unique in this session
                    </p>
                </div>
            </div>
        </div>
    );
};
