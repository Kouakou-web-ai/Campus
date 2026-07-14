import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { useSyncStore } from '../store/syncStore';
import { WifiOff } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, sessionExpiredOffline } = useAuthStore();
  const { isOnline } = useSyncStore();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    if (sessionExpiredOffline || !isOnline) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
          <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
              <WifiOff size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Reconnexion nécessaire</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Votre session a expiré ou aucun cache n'est disponible hors ligne. L'accès sécurisé à votre espace universitaire nécessite une connexion active.
              </p>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-500 font-medium">
              Veuillez rétablir votre connexion internet pour vous authentifier à nouveau.
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-primary w-full text-xs font-semibold"
            >
              Réessayer la connexion
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to="/connexion" replace />;
  }

  return <>{children}</>;
}
