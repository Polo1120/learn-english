import { Link } from 'react-router-dom';

export const CreateGameCard = () => {
  return (
    <Link
      to="/admin"
      className="group flex flex-col items-center justify-center min-h-[350px] bg-gray-50 dark:bg-card-bg/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer"
    >
      <div className="size-16 rounded-full bg-white dark:bg-card-bg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-4xl text-primary">add</span>
      </div>
      <h3 className="text-lg font-bold text-[#111318] dark:text-white mb-1">Create New Game</h3>
      <p className="text-[#637588] dark:text-gray-400 text-sm text-center px-6">
        Add a new quiz, hangman, or flashcard set.
      </p>
    </Link>
  );
};
