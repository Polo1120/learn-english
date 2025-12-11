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
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
            <div className="card max-w-md w-full">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold mb-2">🎮 {sessionTitle}</h1>
                    <p className="text-slate-600">
                        Ingresa tu apodo para participar en esta sesión
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="nickname" className="block text-sm font-medium mb-2">
                            Apodo
                        </label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setError('');
                            }}
                            placeholder="Tu apodo único"
                            className="input w-full"
                            maxLength={20}
                            autoFocus
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            3-20 caracteres, solo letras y números
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                            <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={nickname.trim().length < 3}
                    >
                        Comenzar a Jugar
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <p className="text-xs text-slate-500 text-center">
                        💡 Tu apodo debe ser único en esta sesión
                    </p>
                </div>
            </div>
        </div>
    );
};
