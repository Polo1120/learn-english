import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Game } from '../types';
import { gamesService } from '../services/gamesService';
import { useAuth } from './AuthContext';

interface ContentContextType {
    games: Game[];
    addGame: (game: Omit<Game, 'id'>) => Promise<void>;
    updateGame: (id: string, game: Partial<Omit<Game, 'id'>>) => Promise<void>;
    deleteGame: (id: string) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};

export const ContentProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedRef = useRef(false);

    // Load games when user is authenticated
    useEffect(() => {
        if (!authLoading && isAuthenticated && !hasLoadedRef.current) {
            hasLoadedRef.current = true;
            loadGames();
        } else if (!authLoading && !isAuthenticated) {
            setLoading(false);
            hasLoadedRef.current = false;
        }
    }, [isAuthenticated, authLoading]);

    const loadGames = async () => {
        try {
            setLoading(true);
            setError(null);
            const fetchedGames = await gamesService.getAll();
            setGames(fetchedGames);
        } catch (err: any) {
            console.error('Error loading games:', err);
            setError(err.message || 'Failed to load games');
        } finally {
            setLoading(false);
        }
    };

    const addGame = async (game: Omit<Game, 'id'>) => {
        try {
            setError(null);
            const newGame = await gamesService.create(game);
            setGames(prev => [...prev, newGame]);
        } catch (err: any) {
            console.error('Error adding game:', err);
            setError(err.message || 'Failed to add game');
            throw err;
        }
    };

    const updateGame = async (id: string, game: Partial<Omit<Game, 'id'>>) => {
        try {
            setError(null);
            const updated = await gamesService.update(id, game);
            setGames(prev => prev.map(g => g.id === id ? updated : g));
        } catch (err: any) {
            console.error('Error updating game:', err);
            setError(err.message || 'Failed to update game');
            throw err;
        }
    };

    const deleteGame = async (id: string) => {
        try {
            setError(null);
            const success = await gamesService.delete(id);
            if (success) {
                setGames(prev => prev.filter(game => game.id !== id));
            }
        } catch (err: any) {
            console.error('Error deleting game:', err);
            setError(err.message || 'Failed to delete game');
            throw err;
        }
    };

    return (
        <ContentContext.Provider value={{ games, addGame, updateGame, deleteGame, loading, error }}>
            {children}
        </ContentContext.Provider>
    );
};
