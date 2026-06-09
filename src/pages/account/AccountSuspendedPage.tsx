import { PauseCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountSuspendedPage() {
  return (
    <div className="card bg-surface border border-border-subtle shadow-xl">
      <div className="card-body items-center text-center gap-6 py-10">
        <div className="w-16 h-16 rounded-2xl bg-neutral/20 flex items-center justify-center">
          <PauseCircle size={32} className="text-content-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Compte suspendu</h1>
          <p className="text-content-secondary mt-3 leading-relaxed max-w-md">
            Votre compte a été suspendu par l'administration. L'accès au tableau de bord est temporairement désactivé.
          </p>
        </div>
        <p className="text-sm text-content-muted max-w-md">
          Pour rétablir l'accès, veuillez contacter l'administration de votre établissement.
        </p>
        <Link to="/contact" className="btn btn-outline btn-sm">
          Contacter le support
        </Link>
      </div>
    </div>
  );
}
