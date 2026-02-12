
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SessionLoading = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={48} />
            <p className="text-slate-600">Cargando sesión...</p>
        </div>
    </div>
);

export const SessionError = ({ error }: { error?: string | null }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error || 'Sesión no encontrada'}</p>
            <Link to="/" className="btn btn-primary">
                Ir al Inicio
            </Link>
        </div>
    </div>
);
