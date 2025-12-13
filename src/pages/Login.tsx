import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
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
        <div className="relative min-h-screen w-full overflow-hidden bg-dark-bg flex flex-col items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-[#020617]"></div>
                {/* Noise overlay - using a CSS pattern or simple div if image fails, but keeping URL as requested */}
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                <div className="absolute -top-[10%] -left-[5%] w-[45%] h-[45%] rounded-full bg-primary/20 blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[35%] h-[35%] rounded-full bg-secondary/20 blur-[100px]"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-accent-purple/10 blur-[110px]"></div>
            </div>

            {/* Login Card */}
            <div className="glass-card relative z-10 w-full max-w-[440px] rounded-2xl p-8 sm:p-10 flex flex-col gap-6">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg shadow-primary/25 text-slate-900 mb-2">
                        <span className="material-symbols-outlined text-[32px]">school</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">Welcome Back</h1>
                        <p className="text-slate-400 text-base font-normal">Sign in to continue learning English</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 text-center">
                        {error}
                    </div>
                )}

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1" htmlFor="email">Email Address</label>
                        <div className="group relative flex items-center">
                            <input
                                className="w-full h-12 rounded-lg input-glass text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pl-4 pr-12 transition-all duration-200"
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
                            <label className="text-sm font-semibold text-slate-300" htmlFor="password">Password</label>
                            <a className="text-xs text-secondary hover:text-accent-purple font-medium transition-colors" href="#">Forgot Password?</a>
                        </div>
                        <div className="group relative flex items-center">
                            <input
                                className="w-full h-12 rounded-lg input-glass text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 pl-4 pr-12 transition-all duration-200"
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
                        className="w-full h-12 mt-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 font-bold rounded-lg shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                        {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
                    </button>
                </form>
            </div>
        </div>
    );
};
