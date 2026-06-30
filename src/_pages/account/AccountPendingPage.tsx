import { useState } from 'react';
import { Clock, Mail, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPostLoginPath } from '../../constants/accountStatus';

export default function AccountPendingPage() {
  const navigate = useNavigate();
  const { refreshUserProfile } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshUserProfile();
      const user = useAuthStore.getState().user;
      if (user?.status === 'active') {
        navigate(getPostLoginPath(user), { replace: true });
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="card bg-surface border border-border-subtle shadow-xl">
      <div className="card-body items-center text-center gap-6 py-10">
        <div className="w-16 h-16 rounded-2xl bg-warning/15 flex items-center justify-center">
          <Clock size={32} className="text-warning" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Compte en attente de validation</h1>
          <p className="text-content-secondary mt-3 leading-relaxed max-w-md">
            Votre compte est en attente de validation par l'administration.
          </p>
        </div>
        <div className="alert alert-info text-sm max-w-md">
          <Mail size={18} />
          <span>
            Vous recevrez l'accès à votre tableau de bord dès que votre demande sera approuvée.
          </span>
        </div>
        <Link to="/contact" className="btn btn-outline btn-primary btn-sm">
          Contacter le support
        </Link>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={checking}
          className="btn btn-ghost btn-sm gap-2"
        >
          {checking ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <RefreshCw size={14} />
          )}
          Actualiser le statut
        </button>
      </div>
    </div>
  );
}
