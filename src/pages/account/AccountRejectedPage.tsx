import { Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountRejectedPage() {
  return (
    <div className="card bg-surface border border-border-subtle shadow-xl">
      <div className="card-body items-center text-center gap-6 py-10">
        <div className="w-16 h-16 rounded-2xl bg-error/15 flex items-center justify-center">
          <Ban size={32} className="text-error" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-content">Demande refusée</h1>
          <p className="text-content-secondary mt-3 leading-relaxed max-w-md">
            Votre demande d'inscription a été refusée par l'administration.
          </p>
        </div>
        <p className="text-sm text-content-muted max-w-md">
          Si vous pensez qu'il s'agit d'une erreur, contactez l'administration de votre université ou notre équipe support.
        </p>
        <Link to="/contact" className="btn btn-primary btn-sm">
          Contacter le support
        </Link>
      </div>
    </div>
  );
}
