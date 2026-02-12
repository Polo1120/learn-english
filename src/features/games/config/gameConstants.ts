import type { GameType } from '../../../shared/types';

export type GameConstantsType = GameType | 'unknown';

export interface GameConstants {
    type: GameConstantsType;
    image: string;
    badgeColor: string;
    icon: string;
}

const GAME_CONFIG: Record<GameType, Omit<GameConstants, 'type'>> = {
    quiz: {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxG3-meDnQZPvsbIIUsSURUb5nNH5awpjDuDXrGRPeLmRfWrMl8b-jKgEQnPaATLKKjpKZHM4qxoePGJxspR-tR-ATw-OrMmCOx-12wwVh5Ljz-HHUkQ_CMBpcxmVtgVRQADulVtvJeFQoOb1m5ZU8Xhhhu-hCH-IMRGeEnlhxfmpQVOZkIav4RyX1aADFk9k59x1eOjQ4A9csHeK80TOonESpCuGCQtGTiCMszMbe0QYD5pDugN4njDw1SJ2BASRlgakmLG1tkk0',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        icon: 'quiz',
    },
    hangman: {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhEH3Tu7lEnWvApN1MW-89IlAVKCC5PjtmgcgMrri42PxHJVSNXAYCYjzvepRnxtgNYWtnUCVSNclME3qA9aRwxDkvUiOib22ibpz4L_Ps7VrXAWyy0ZhtE74grKXIHgkPE8hQOxHZy6Mi4_gnb2GzCGn1jgXggbYbIlDhzoZq9_3zQxeSalb4QQmp8FPMa8aE6PebVziqOorMT7Xt0Uou4nqN68IsY5w21pJukXLvCyvUhs3PlmV_yeJ5xI8K2wrPN0Qb0jbU1Mo',
        badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        icon: 'videogame_asset',
    },
    flashcard: {
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmAvLgLll1HVpfec7X8kNSY1q9N5OV0kD5xuUUQfAVSd5UrI3XrnVnwy6P9PTez4nHrxQNWYvuOxOZsntcac0rH1oBBj1BWtQMA9-PzBQOXPr6GZGeZhwkuK0vWtKYZYUPGyxLM7TutUx4hnJmYChnWui8wXflRvXFbLCN1DCKFsKJLMKkiiX-Qr-8zuYtSlllXdeBrembjxvk-GRx5zxqthJBgYVWzn6ImWK9CXTBmukHo3uRzEqnGrdRtLEvvcId2q_MGKXWKRs',
        badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
        icon: 'style',
    },
};

const DEFAULT_CONFIG: Omit<GameConstants, 'type'> = {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3ZNI7AuVnQ9YfwFvSXOshZfqTv5ZN4kzmsXUt7xXi6Tx49GuXW1AuQBMVc4pIYFUb5vlxUB-UUaps1tbiU4iNeztYD7W5r0cJH6Bc8HgSSDl4URp10pGGIAKLMaDTvAPfy2OXsmxMECuKpTaYBRbBwVrFwDZPVhS7qSsIRnaV9vSRnRPmHGPd_65oTYWnE1sR3w5lWyrCYjAms2Lj1BojQwK2W1AaUGH9YfUVDzPn9QWNOeKsFy8K-iLzW70PlrkSqKsXi-0L6_E',
    badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    icon: 'gamepad',
};

export const getGameConstants = (type: string): GameConstants => {
    const validType = type as GameType;
    if (validType in GAME_CONFIG) {
        return { type: validType, ...GAME_CONFIG[validType] };
    }
    return { type: 'unknown', ...DEFAULT_CONFIG };
};

export const GAME_TYPE_OPTIONS = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'hangman', label: 'Ahorcado' },
    { value: 'flashcard', label: 'Flashcards' },
];

export const GAME_TYPE_LABELS: Record<GameType, string> = {
    quiz: 'Quiz',
    hangman: 'Ahorcado',
    flashcard: 'Flashcards',
};
