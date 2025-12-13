import { supabase } from '../lib/supabase';
import type { Game } from '../types';

export const gamesService = {

    async getAll(): Promise<Game[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error: any) {
            console.error('Error fetching games:', error);
            throw error;
        }
    },

    /**
     * Get a single game by ID
     */
    async getOne(id: string): Promise<Game | null> {
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching game:', error);
            return null;
        }
    },

    /**
     * Create a new game
     */
    async create(game: Omit<Game, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Game> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('games')
                .insert({
                    ...game,
                    user_id: user.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error creating game:', error);
            throw error;
        }
    },

    /**
     * Update an existing game
     */
    async update(id: string, game: Partial<Omit<Game, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Game> {
        try {
            const { data, error } = await supabase
                .from('games')
                .update({
                    ...game,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error updating game:', error);
            throw error;
        }
    },

    /**
     * Delete a game
     */
    async delete(id: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('games')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error: any) {
            console.error('Error deleting game:', error);
            return false;
        }
    },

    /**
     * Subscribe to real-time changes
     */
    subscribe(callback: (payload: any) => void) {
        const channel = supabase
            .channel('games_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'games' },
                callback
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    },
};
