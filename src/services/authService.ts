import { supabase } from '../lib/supabase';
import type { User, LoginCredentials } from '../types';

export const authService = {

    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });

            if (error) throw error;
            if (!data.user) throw new Error('No user returned');

            return data.user as User;
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Invalid email or password');
        }
    },




    async logout(): Promise<void> {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
    },


    async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user as User | null;
    },


    async isAuthenticated(): Promise<boolean> {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },


    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },


    onAuthChange(callback: (user: User | null) => void) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            callback(session?.user as User | null);
        });

        return () => subscription.unsubscribe();
    },
};
