import { useState } from 'react';
import { X, Copy, Check, Share2, Calendar } from 'lucide-react';
import type { Game } from '../../../shared/types';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

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
    const [state, setState] = useState({
        title: `${game.title} - Public Session`,
        durationHours: 24,
        maxAttempts: undefined as number | undefined,
        isCreating: false,
        sessionCode: null as string | null,
        copied: false,
        errorModal: { isOpen: false, message: '' }
    });
    const { title, durationHours, maxAttempts, isCreating, sessionCode, copied, errorModal } = state;

    const handleCreate = async () => {
        setState((prev) => ({ ...prev, isCreating: true }));
        try {
            const code = await onCreateSession(title, durationHours, maxAttempts);
            setState((prev) => ({ ...prev, sessionCode: code }));
        } catch (error) {
            console.error('Error creating session:', error);
            setState((prev) => ({ ...prev, errorModal: { isOpen: true, message: 'Error creating session. Please try again.' } }));
        } finally {
            setState((prev) => ({ ...prev, isCreating: false }));
        }
    };

    const getSessionUrl = () => {
        if (!sessionCode) return '';
        return `${window.location.origin}/session/${sessionCode}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getSessionUrl());
            setState((prev) => ({ ...prev, copied: true }));
            setTimeout(() => setState((prev) => ({ ...prev, copied: false })), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Join my game session: ${game.title}!`,
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
        setState({
            title: `${game.title} - Public Session`,
            durationHours: 24,
            maxAttempts: undefined,
            isCreating: false,
            sessionCode: null,
            copied: false,
            errorModal: { isOpen: false, message: '' }
        });
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
                            {sessionCode ? '✅ Session Created' : '🎮 Create Public Session'}
                        </h2>
                        <p className="text-slate-600 text-sm">
                            {sessionCode
                                ? 'Share the link for others to join'
                                : 'Configure your public game session'
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
                            <label htmlFor="title" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                                Session Title
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setState((prev) => ({ ...prev, title: e.target.value }))}
                                className="input w-full"
                                placeholder="Ex: Vocabulary Challenge"
                            />
                        </div>

                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                                <Calendar size={16} className="inline mr-1" />
                                Duration
                            </label>
                            <select
                                id="duration"
                                value={durationHours}
                                onChange={(e) => setState((prev) => ({ ...prev, durationHours: Number(e.target.value) }))}
                                className="input w-full"
                            >
                                <option value={1}>1 hour</option>
                                <option value={6}>6 hours</option>
                                <option value={12}>12 hours</option>
                                <option value={24}>24 hours</option>
                                <option value={48}>2 days</option>
                                <option value={168}>1 week</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="maxAttempts" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                                🔄 Max Attempts per User
                            </label>
                            <select
                                id="maxAttempts"
                                value={maxAttempts || ''}
                                onChange={(e) => setState((prev) => ({ ...prev, maxAttempts: e.target.value ? Number(e.target.value) : undefined }))}
                                className="input w-full"
                            >
                                <option value="">Unlimited</option>
                                <option value={1}>1 attempt</option>
                                <option value={2}>2 attempts</option>
                                <option value={3}>3 attempts</option>
                                <option value={5}>5 attempts</option>
                                <option value={10}>10 attempts</option>
                            </select>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Number of times each user can play
                            </p>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-500/30 rounded-lg p-4">
                            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
                                📋 Game Details
                            </h3>
                            <div className="space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
                                <p><strong>Game:</strong> {game.title}</p>
                                <p><strong>Type:</strong> {game.type}</p>
                                <p><strong>Participants:</strong> Unlimited</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleClose}
                                className="btn btn-outline flex-1"
                                disabled={isCreating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                className="btn btn-primary flex-1"
                                disabled={isCreating || !title.trim()}
                            >
                                {isCreating ? 'Creating...' : 'Create Session'}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Session Created - Share Link */
                    <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Check className="text-green-600 dark:text-green-400" size={20} />
                                <h3 className="font-semibold text-green-900 dark:text-green-200">
                                    Session created successfully!
                                </h3>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Session code: <strong className="font-mono">{sessionCode}</strong>
                            </p>
                        </div>

                        <div>
                            <label htmlFor="sessionShareUrl" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-200">
                                Share Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="sessionShareUrl"
                                    type="text"
                                    value={getSessionUrl()}
                                    readOnly
                                    className="input flex-1 font-mono text-sm"
                                />
                                <button
                                    onClick={handleCopy}
                                    className="btn btn-outline px-4"
                                    title="Copy link"
                                >
                                    {copied ? (
                                        <Check size={20} className="text-green-600 dark:text-green-400" />
                                    ) : (
                                        <Copy size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                onClick={handleShare}
                                className="btn btn-primary flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} />
                                Share
                            </button>
                            <button
                                onClick={handleClose}
                                className="btn btn-outline"
                            >
                                Close
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-2 text-sm">
                                💡 Instructions
                            </h4>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                <li>• Share the link with participants</li>
                                <li>• Each person must enter a unique nickname</li>
                                <li>• Scores are updated in real-time</li>
                                <li>• The session expires in {durationHours} hour{durationHours > 1 ? 's' : ''}</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={errorModal.isOpen}
                onClose={() => setState((prev) => ({ ...prev, errorModal: { ...prev.errorModal, isOpen: false } }))}
                onConfirm={() => setState((prev) => ({ ...prev, errorModal: { ...prev.errorModal, isOpen: false } }))}
                title="Error"
                message={errorModal.message}
                confirmText="Got it"
                variant="danger"
            />
        </div >
    );
};
