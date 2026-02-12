import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, Profile } from '../shared/types';
import { authService } from '../features/auth/services/authService';
import { supabase } from '../shared/lib/supabase';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string, userEmail: string, userMeta: any) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    const newProfile = {
                        id: userId,
                        email: userEmail,
                        role: 'student' as const,
                        full_name: userMeta?.name || userEmail?.split('@')[0],
                    };

                    const { data: created, error: createError } = await supabase
                        .from('profiles')
                        .insert(newProfile)
                        .select()
                        .single();

                    if (createError) throw createError;
                    setProfile(created as Profile);
                } else {
                    console.error('Error fetching profile:', error);
                }
            } else {
                setProfile(data as Profile);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    await fetchProfile(currentUser.id, currentUser.email!, currentUser.user_metadata);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        const unsubscribe = authService.onAuthChange(async (newUser) => {
            setUser(newUser);
            if (newUser) {
                await fetchProfile(newUser.id, newUser.email!, newUser.user_metadata);
            } else {
                setProfile(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const user = await authService.login(credentials);
            setUser(user);
            if (user) {
                await fetchProfile(user.id, user.email!, user.user_metadata);
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
