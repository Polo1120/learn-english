import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../features/profile/hooks/useProfile';
import { ConfirmationModal } from './ConfirmationModal';
import {
    LayoutDashboard,
    PlusCircle,
    LogOut,
    Menu,
    X,
    Moon,
    Sun,
    Gamepad2,
} from 'lucide-react';

export const Layout = () => {
    const { logout } = useAuth();
    const { profile, loading: profileLoading } = useProfile();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isTeacher = !profileLoading && (profile?.role === 'teacher' || !profile);
    const isStudent = !profileLoading && profile?.role === 'student';

    const teacherLinks = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/sessions', icon: Gamepad2, label: 'Sessions' },
        { to: '/admin', icon: PlusCircle, label: 'Create Game' },
    ];

    const studentLinks = [
        { to: '/', icon: LayoutDashboard, label: 'My Space' },
        { to: '/MyGames', icon: Gamepad2, label: 'My Games' },
    ];

    const navLinks = isStudent ? studentLinks : teacherLinks;

    return (
        <div className="flex h-screen bg-light-bg dark:bg-dark-bg text-text-main dark:text-gray-100 font-display transition-colors duration-300">
            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex w-64 flex-col glass-panel border-r border-slate-200 dark:border-white/10 dark:bg-card-bg/50">
                <a href='/' className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">school</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        English Quest
                    </span>
                </a>

                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                    : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                                    }`}
                            >
                                <Icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                    <div className="px-4 py-2 mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="text-sm font-bold truncate">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-slate-500 capitalize">{profile?.role || 'Teacher'}</p>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>

                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="md:hidden h-16 glass-panel border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-4 sticky top-0 z-50 gap-4">
                    <a href='/' className="flex items-center gap-2 truncate">
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-xl">school</span>
                        </div>
                        <span className="font-bold text-lg truncate">English Quest</span>
                    </a>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 relative z-50"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                        }`}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm mt-16"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div
                        className={`absolute right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-card-bg shadow-2xl p-4 flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 dark:border-white/10 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                            }`}
                        onClick={e => e.stopPropagation()}
                    >
                        <nav className="space-y-2 flex-1 mt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${location.pathname === link.to
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 hover:text-primary dark:hover:text-white'
                                        }`}
                                >
                                    <link.icon size={20} />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="border-t border-slate-200 dark:border-white/10 pt-4 space-y-2">
                            <button
                                onClick={toggleTheme}
                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-gray-400 transition-colors"
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                <span className="font-medium">Switch Theme</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsLogoutModalOpen(true);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-8 relative pb-24 md:pb-8">
                    {/* Background Gradients */}
                    <div className="fixed inset-0 z-0 pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 dark:bg-primary/10 blur-[120px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 dark:bg-purple-600/10 blur-[100px]"></div>
                    </div>
                    <div className="relative z-10 max-w-7xl mx-auto w-full">
                        <Outlet context={{ isStudent, isTeacher }} />
                    </div>
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
        </div>
    );
};
