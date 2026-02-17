import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import type { Game } from '../../../shared/types';
import { getGameConstants } from '../config/gameConstants';
import { MoreVertical, Edit2, Share2, UserPlus, Trash2 } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onDelete?: (e: React.MouseEvent, id: string, title: string) => void;
  onShare?: (e: React.MouseEvent, game: Game) => void;
  onAssign?: (e: React.MouseEvent, game: Game) => void;
  showActions?: boolean;
}

export const GameCard = ({ game, onDelete, onShare, onAssign, showActions = true }: GameCardProps) => {
  const { image, badgeColor, icon } = getGameConstants(game.type);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="group bg-white dark:bg-card-bg rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden">
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${badgeColor}`}>
            {game.type}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <span className="material-symbols-outlined text-3xl mb-1">{icon}</span>
        </div>

        {showActions && (
          <div className="absolute top-4 right-4" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="size-8 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in duration-200">
                <Link
                  to={`/admin/edit/${game.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Edit2 size={16} className="text-indigo-500" />
                  Edit Game
                </Link>

                {onShare && (
                  <button
                    onClick={(e) => {
                      onShare(e, game);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <Share2 size={16} className="text-green-500" />
                    Share Session
                  </button>
                )}

                {onAssign && (
                  <button
                    onClick={(e) => {
                      onAssign(e, game);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <UserPlus size={16} className="text-blue-500" />
                    Assign to Student
                  </button>
                )}

                <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                <button
                  onClick={(e) => {
                    onDelete?.(e, game.id, game.title);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-2 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-[#637588] dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
          {game.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            to={`/game/${game.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 h-10 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all transform active:scale-95"
          >
            Play Now
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

