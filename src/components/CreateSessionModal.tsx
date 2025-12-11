import { useState } from 'react';
import { X, Copy, Check, Share2, Calendar } from 'lucide-react';
import type { Game } from '../types';

interface CreateSessionModalProps {
    game: Game;
    isOpen: boolean;
    onClose: () => void;
    onCreateSession: (title: string, durationHours: number, maxAttempts?: number) => Promise<string>;
}

export const CreateSessionModal = ({
    game,
    isOpen,
    onClose,
    onCreateSession
}: CreateSessionModalProps) => {
    const [title, setTitle] = useState(`${game.title} - Sesión Pública`);
    const [durationHours, setDurationHours] = useState(24);
    const [maxAttempts, setMaxAttempts] = useState<number | undefined>(undefined);
    const [isCreating, setIsCreating] = useState(false);
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const code = await onCreateSession(title, durationHours, maxAttempts);
            setSessionCode(code);
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Error al crear la sesión. Por favor intenta de nuevo.');
        } finally {
            setIsCreating(false);
        }
    };

    const getSessionUrl = () => {
        if (!sessionCode) return '';
        return `${window.location.origin}/session/${sessionCode}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getSessionUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `¡Únete a mi sesión de juego: ${game.title}!`,
                    url: getSessionUrl(),
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            handleCopy();
        }
    };

    const handleClose = () => {
        setSessionCode(null);
        setTitle(`${game.title} - Sesión Pública`);
        setDurationHours(24);
        setMaxAttempts(undefined);
        setCopied(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card max-w-lg w-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">
                            {sessionCode ? '✅ Sesión Creada' : '🎮 Crear Sesión Pública'}
                        </h2>
                        <p className="text-slate-600 text-sm">
                            {sessionCode
                                ? 'Comparte el link para que otros participen'
                                : 'Configura tu sesión de juego pública'
                            }
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {!sessionCode ? (
                    /* Configuration Form */
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Título de la Sesión
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input w-full"
                                placeholder="Ej: Desafío de Vocabulario"
                            />
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium mb-2">
                                <Calendar size={16} className="inline mr-1" />
                                Duración
                            </label>
                            <select
                                id="duration"
                                value={durationHours}
                                onChange={(e) => setDurationHours(Number(e.target.value))}
                                className="input w-full"
                            >
                                <option value={1}>1 hora</option>
                                <option value={6}>6 horas</option>
                                <option value={12}>12 horas</option>
                                <option value={24}>24 horas</option>
                                <option value={48}>2 días</option>
                                <option value={168}>1 semana</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="maxAttempts" className="block text-sm font-medium mb-2">
                                🔄 Intentos Máximos por Usuario
                            </label>
                            <select
                                id="maxAttempts"
                                value={maxAttempts || ''}
                                onChange={(e) => setMaxAttempts(e.target.value ? Number(e.target.value) : undefined)}
                                className="input w-full"
                            >
                                <option value="">Ilimitados</option>
                                <option value={1}>1 intento</option>
                                <option value={2}>2 intentos</option>
                                <option value={3}>3 intentos</option>
                                <option value={5}>5 intentos</option>
                                <option value={10}>10 intentos</option>
                            </select>
                            <p className="text-xs text-slate-500 mt-1">
                                Número de veces que cada usuario puede jugar
                            </p>
                        </div>

                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="font-semibold text-indigo-900 mb-2">
                                📋 Detalles del Juego
                            </h3>
                            <div className="space-y-1 text-sm text-indigo-700">
                                <p><strong>Juego:</strong> {game.title}</p>
                                <p><strong>Tipo:</strong> {game.type}</p>
                                <p><strong>Participantes:</strong> Ilimitados</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleClose}
                                className="btn btn-outline flex-1"
                                disabled={isCreating}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary flex-1"
                                disabled={isCreating || !title.trim()}
                            >
                                {isCreating ? 'Creando...' : 'Crear Sesión'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Session Created - Share Link */
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="text-green-600" size={20} />
                                <h3 className="font-semibold text-green-900">
                                    ¡Sesión creada exitosamente!
                                </h3>
                            </div>
                            <p className="text-sm text-green-700">
                                Código de sesión: <strong className="font-mono">{sessionCode}</strong>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Link para Compartir
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={getSessionUrl()}
                                    readOnly
                                    className="input flex-1 font-mono text-sm"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="btn btn-outline px-4"
                                    title="Copiar link"
                                >
                                    {copied ? (
                                        <Check size={20} className="text-green-600" />
                                    ) : (
                                        <Copy size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleShare}
                                className="btn btn-primary flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                Compartir
                            </button>
                            <button
                                onClick={handleClose}
                                className="btn btn-outline"
                            >
                                Cerrar
                            </button>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                                💡 Instrucciones
                            </h4>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• Comparte el link con los participantes</li>
                                <li>• Cada persona debe ingresar un apodo único</li>
                                <li>• Las puntuaciones se actualizan en tiempo real</li>
                                <li>• La sesión expira en {durationHours} hora{durationHours > 1 ? 's' : ''}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
