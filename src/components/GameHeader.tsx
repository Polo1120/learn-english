import type { ReactNode } from 'react';

interface GameHeaderProps {
    title: string;
    onShare?: () => void;
    onExit?: () => void;
    children?: ReactNode;
}

export const GameHeader = ({ title, onShare, onExit, children }: GameHeaderProps) => {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4 text-[#111318] dark:text-white">
                <div className="size-8 flex items-center justify-center text-primary-legacy-DEFAULT dark:text-primary">
                    <span className="material-symbols-outlined !text-3xl">school</span>
                </div>
                <h2 className="text-[#111318] dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em]">
                    {title}
                </h2>
            </div>
            <div className="flex flex-1 justify-end gap-3 sm:gap-6 items-center">
                {onShare && (
                    <button
                        onClick={onShare}
                        className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary/10 hover:bg-primary/20 text-primary-legacy-dark dark:text-primary text-sm font-bold leading-normal transition-colors duration-200"
                    >
                        <span className="material-symbols-outlined !text-lg">share</span>
                        <span className="hidden sm:inline">Share Session</span>
                    </button>
                )}

                {children}

                {onExit && (
                    <button
                        onClick={onExit}
                        className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-500 text-sm font-bold leading-normal transition-colors duration-200"
                    >
                        <span className="material-symbols-outlined !text-lg">logout</span>
                        <span className="hidden sm:inline">Exit Game</span>
                    </button>
                )}
            </div>
        </div>
    );
};
