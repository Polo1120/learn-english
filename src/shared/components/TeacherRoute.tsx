import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface TeacherRouteProps {
    children: React.ReactNode;
}

export const TeacherRoute = ({ children }: TeacherRouteProps) => {
    const { isAuthenticated, loading, profile } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (profile?.role !== 'teacher') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
