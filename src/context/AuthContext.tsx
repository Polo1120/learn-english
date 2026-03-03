import { createContext, useContext, useEffect, useReducer } from 'react';
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

type AuthState = {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
};

type AuthAction =
    | { type: 'init'; user: User | null; profile: Profile | null }
    | { type: 'setAuth'; user: User | null; profile: Profile | null }
    | { type: 'logout' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    if (action.type === 'init') {
        return { user: action.user, profile: action.profile, loading: false };
    }
    if (action.type === 'setAuth') {
        return { ...state, user: action.user, profile: action.profile };
    }
    return { ...state, user: null, profile: null };
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, dispatchAuth] = useReducer(authReducer, {
        user: null,
        profile: null,
        loading: true
    });
    const { user, profile, loading } = authState;

    const fetchProfile = async (userId: string, userEmail: string, userMeta: any): Promise<Profile | null> => {
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
                    return created as Profile;
                } else {
                    console.error('Error fetching profile:', error);
                    return null;
                }
            } else {
                return data as Profile;
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            return null;
        }
        return null;
    };

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) {
                    const currentProfile = await fetchProfile(currentUser.id, currentUser.email!, currentUser.user_metadata);
                    dispatchAuth({ type: 'init', user: currentUser, profile: currentProfile });
                } else {
                    dispatchAuth({ type: 'init', user: null, profile: null });
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                dispatchAuth({ type: 'init', user: null, profile: null });
            }
        };

        initAuth();

        const unsubscribe = authService.onAuthChange(async (newUser) => {
            if (newUser) {
                const newProfile = await fetchProfile(newUser.id, newUser.email!, newUser.user_metadata);
                dispatchAuth({ type: 'setAuth', user: newUser, profile: newProfile });
            } else {
                dispatchAuth({ type: 'setAuth', user: null, profile: null });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const user = await authService.login(credentials);
            if (user) {
                const userProfile = await fetchProfile(user.id, user.email!, user.user_metadata);
                dispatchAuth({ type: 'setAuth', user, profile: userProfile });
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        dispatchAuth({ type: 'logout' });
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
