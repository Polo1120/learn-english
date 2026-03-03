import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center p-4 transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-[#020617] transition-colors duration-300"></div>
                {/* Noise overlay */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 mix-blend-overlay brightness-100 contrast-150 dark:mix-blend-overlay dark:opacity-20"></div>
                <div className="absolute -top-[10%] -left-[5%] w-[45%] h-[45%] rounded-full bg-primary/20 dark:bg-primary/20 blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/20 dark:bg-secondary/20 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent-purple/15 dark:bg-accent-purple/10 blur-[110px]"></div>
            </div>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-4 right-4 z-20 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
                <span className="material-symbols-outlined text-[24px]">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
            </button>

            {/* Login Card */}
            <div className="glass-card dark:bg-white/5 relative z-10 w-full max-w-[440px] rounded-2xl p-8 sm:p-10 flex flex-col gap-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-none backdrop-blur-xl border border-white/80 dark:border-white/10 transition-all duration-300">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/20 text-white mb-2">
                        <span className="material-symbols-outlined text-[32px]">school</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-text-main dark:text-white">Welcome Back</h1>
                        <p className="text-text-sub dark:text-slate-400 text-base font-normal">Sign in to continue learning English</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 text-center">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Email Address</label>
                        <div className="group relative flex items-center">
                            <input
                                className="w-full h-12 rounded-lg bg-[rgba(241,245,249,0.5)] dark:bg-white/5 border border-[rgba(203,213,225,0.6)] dark:border-white/10 text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 pl-4 pr-12 transition-all duration-200"
                                id="email"
                                placeholder="you@example.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <div className="absolute right-4 text-slate-400 group-focus-within:text-primary transition-colors duration-200 pointer-events-none flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                            <a className="text-xs text-secondary hover:text-accent-purple font-medium transition-colors" href="/forgot-password">Forgot Password?</a>
                        </div>
                        <div className="group relative flex items-center">
                            <input
                                className="w-full h-12 rounded-lg bg-[rgba(241,245,249,0.5)] dark:bg-white/5 border border-[rgba(203,213,225,0.6)] dark:border-white/10 text-text-main dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 pl-4 pr-12 transition-all duration-200"
                                id="password"
                                placeholder="••••••••"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <div className="absolute right-4 text-slate-400 group-focus-within:text-primary transition-colors duration-200 pointer-events-none flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 mt-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-white font-bold rounded-lg shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                        {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                    </button>
                </form>
            </div>
        </div>
    );
};
