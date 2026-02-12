import { useAuth } from '../../../context/AuthContext';

export const useProfile = () => {
    const { profile, loading } = useAuth();

    return {
        profile,
        loading,
        error: null
    };
};
