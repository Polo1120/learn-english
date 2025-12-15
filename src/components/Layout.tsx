import { Link, Outlet, useLocation } from 'react-router-dom';
import { ConfirmationModal } from './ConfirmationModal';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Layout = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
                        <div className="hidden md:flex items-center gap-6 sm:gap-8">
                            <nav className="hidden md:flex items-center gap-6">
                                <Link to="/" className={`flex items-center gap-2 font-bold text-sm transition-colors ${isActive('/') === 'active' ? 'text-primary' : 'text-[#637588] dark:text-gray-400 hover:text-primary'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${isActive('/') === 'active' ? 'fill-1' : ''}`}>home</span>
                                    Home
                                </Link>
                                <Link to="/sessions" className={`flex items-center gap-2 font-medium text-sm transition-colors ${isActive('/sessions') === 'active' ? 'text-primary' : 'text-[#637588] dark:text-gray-400 hover:text-primary'}`}>
                                    <span className={`material-symbols-outlined text-[20px] ${isActive('/sessions') === 'active' ? 'fill-1' : ''}`}>leaderboard</span>
                                    My Sessions
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
                                    onClick={() => setIsLogoutModalOpen(true)}
                                    className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow-md"
                                >
                                    <span className="material-symbols-outlined text-[20px]">logout</span>
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="flex items-center justify-center size-10 rounded-lg text-[#637588] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[24px]">
                                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                </span>
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="flex items-center justify-center size-10 rounded-lg text-[#637588] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[28px]">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md absolute w-full left-0 animate-fade-in-down shadow-lg">
                        <div className="px-4 py-4 space-y-2">
                            <Link
                                to="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/') === 'active' ? 'bg-primary/10 text-primary' : 'text-[#637588] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <span className="material-symbols-outlined text-[24px]">home</span>
                                Home
                            </Link>
                            <Link
                                to="/sessions"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/sessions') === 'active' ? 'bg-primary/10 text-primary' : 'text-[#637588] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <span className="material-symbols-outlined text-[24px]">leaderboard</span>
                                My Sessions
                            </Link>
                            <Link
                                to="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/admin') === 'active' ? 'bg-primary/10 text-primary' : 'text-[#637588] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <span className="material-symbols-outlined text-[24px]">settings</span>
                                Admin
                            </Link>

                            {user && (
                                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            setIsLogoutModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[24px]">logout</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </header>

            <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <Outlet />
            </main>

            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => {
                    logout();
                    setIsLogoutModalOpen(false);
                }}
                title="Logout"
                message="Are you sure you want to log out?"
                confirmText="Logout"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
};
