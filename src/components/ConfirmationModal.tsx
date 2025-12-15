import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'success';
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
}: ConfirmationModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const getIcon = () => {
        if (variant === 'danger') return <AlertTriangle className="text-red-500" size={32} />;
        if (variant === 'success') return <CheckCircle className="text-green-500" size={32} />;
        return <AlertTriangle className="text-primary" size={32} />;
    };

    const getPrimaryButtonClass = () => {
        if (variant === 'danger') return 'bg-red-500 hover:bg-red-600 shadow-red-500/20';
        if (variant === 'success') return 'bg-green-500 hover:bg-green-600 shadow-green-500/20';
        return 'bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 shadow-primary/20';
    };

    return (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`glass-card bg-white dark:bg-card-bg w-full max-w-sm rounded-2xl shadow-2xl relative z-10 p-6 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center gap-4">
                    <div className={`size-16 rounded-full flex items-center justify-center mb-2 ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/20' :
                            variant === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                                'bg-primary/10'
                        }`}>
                        {getIcon()}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>

                    <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full mt-4">
                        {variant !== 'success' && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onConfirm();
                                if (variant === 'success') onClose();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${getPrimaryButtonClass()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
