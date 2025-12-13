import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Layout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const isActive = (path: string) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <div className="bg-background-light dark:bg-background-dark dark:text-white text-[#111318]  font-display min-h-screen flex flex-col">
            <header className="glass-header sticky top-0 z-[9999] w-full border-b border-[#f0f2f4] dark:border-gray-800 ">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary">
                                <span className="material-symbols-outlined text-2xl">psychology</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight dark:text-white text-black">Learn English</h2>
                        </Link>

                        {/* Navigation & User Actions */}
                        <div className="flex items-center gap-6 sm:gap-8">
                            <nav className="hidden md:flex items-center gap-6">
                                <Link to="/" className={`flex items-center gap-2 font-bold text-sm transition-colors ${isActive('/') === 'active' ? 'text-primary' : 'text-[#637588] dark:text-gray-400 hover:text-primary'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${isActive('/') === 'active' ? 'fill-1' : ''}`}>home</span>
                                    Home
                                </Link>
                                <Link to="/admin" className={`flex items-center gap-2 font-medium text-sm transition-colors ${isActive('/admin') === 'active' ? 'text-primary' : 'text-[#637588] dark:text-gray-400 hover:text-primary'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${isActive('/admin') === 'active' ? 'fill-1' : ''}`}>settings</span>
                                    Admin
                                </Link>
                            </nav>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center size-10 rounded-lg text-[#637588] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            >
                                <span className="material-symbols-outlined text-[24px]">
                                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>

                            {user && (
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <Outlet />
            </main>
        </div>
    );
};
