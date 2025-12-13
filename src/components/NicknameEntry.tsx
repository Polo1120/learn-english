import { useState } from 'react';
import { X } from 'lucide-react';

interface NicknameEntryProps {
    onSubmit: (nickname: string) => void;
    sessionTitle: string;
}

export const NicknameEntry = ({ onSubmit, sessionTitle }: NicknameEntryProps) => {
    const [nickname, setNickname] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedNickname = nickname.trim();

        // Validation
        if (trimmedNickname.length < 3) {
            setError('El apodo debe tener al menos 3 caracteres');
            return;
        }

        if (trimmedNickname.length > 20) {
            setError('El apodo no puede tener más de 20 caracteres');
            return;
        }

        // Only allow alphanumeric and spaces
        if (!/^[a-zA-Z0-9\s]+$/.test(trimmedNickname)) {
            setError('Solo se permiten letras, números y espacios');
            return;
        }

        onSubmit(trimmedNickname);
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white font-display flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="glass-card max-w-md w-full relative z-10 p-8">
                <div className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-4 shadow-lg shadow-primary/10">
                            <span className="material-symbols-outlined text-4xl">sports_esports</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-black mb-2 tracking-tight">
                        {sessionTitle}
                    </h1>
                    <p className="text-gray-400">
                        Ingresa tu apodo para unirte a la sesión
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-bold mb-2 text-gray-300">
                            Tu Apodo
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-gray-500">badge</span>
                            </div>
                            <input
                                id="nickname"
                                type="text"
                                value={nickname}
                                onChange={(e) => {
                                    setNickname(e.target.value);
                                    setError('');
                                }}
                                placeholder="Ej: EagleEye, FastLearner..."
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-white placeholder-gray-500"
                                maxLength={20}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            <p className="text-xs text-gray-500">
                                3-20 caracteres
                            </p>
                            <p className="text-xs text-gray-500">
                                Letras y números
                            </p>
                        </div>

                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                            <X size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-200 font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                        disabled={nickname.trim().length < 3}
                    >
                        <span>Unirse a la Partida</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Tu apodo debe ser único en esta sesión
                    </p>
                </div>
            </div>
        </div>
    );
};
