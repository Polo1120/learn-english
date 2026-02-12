import { Link } from 'react-router-dom';
import type { Game } from '../../../shared/types';
import { getGameConstants } from '../config/gameConstants';

interface GameCardProps {
  game: Game;
  onDelete?: (e: React.MouseEvent, id: string, title: string) => void;
  showActions?: boolean;
}

export const GameCard = ({ game, onDelete, showActions = true }: GameCardProps) => {
  const { image, badgeColor, icon } = getGameConstants(game.type);

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
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-2 group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-[#637588] dark:text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
          {game.description}
        </p>

        {showActions && (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Link
              to={`/game/${game.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-emerald-400 hover:to-cyan-300 text-slate-900 h-9 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              Play Now
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
            <Link
              to={`/admin/edit/${game.id}`}
              className="flex items-center justify-center size-9 rounded-lg text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              title="Edit Game"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </Link>
            <button
              onClick={(e) => onDelete?.(e, game.id, game.title)}
              className="flex items-center justify-center size-9 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Game"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
