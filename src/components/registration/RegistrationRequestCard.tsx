import { Check, Ban, PauseCircle } from 'lucide-react';
import type { RegistrationRequest, UserStatus } from '../../types/userAccount';
import UserStatusBadge from './UserStatusBadge';

interface RegistrationRequestCardProps {
  request: RegistrationRequest;
  showUniversity?: boolean;
  loading?: boolean;
  onAction: (uid: string, status: UserStatus) => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function RegistrationRequestCard({
  request,
  showUniversity = false,
  loading = false,
  onAction,
}: RegistrationRequestCardProps) {
  const canApprove = request.status === 'pending';
  const canReject = request.status === 'pending';
  const canSuspend = request.status === 'active' || request.status === 'pending';

  return (
    <div className="card bg-surface border border-border-subtle shadow-sm">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-content">
              {request.prenom} {request.nom}
            </h3>
            <p className="text-sm text-content-secondary mt-0.5">{request.email}</p>
          </div>
          <UserStatusBadge status={request.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {showUniversity && (
            <div>
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wide">Université</p>
              <p className="text-content-secondary mt-0.5">{request.universityName}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-content-muted uppercase tracking-wide">Date d'inscription</p>
            <p className="text-content-secondary mt-0.5">{formatDate(request.createdDate)}</p>
          </div>
        </div>

        <div className="card-actions justify-end flex-wrap gap-2 pt-2 border-t border-border-subtle">
          <button
            type="button"
            disabled={!canApprove || loading}
            onClick={() => onAction(request.uid, 'active')}
            className="btn btn-success btn-sm gap-1.5"
          >
            <Check size={14} />
            Valider
          </button>
          <button
            type="button"
            disabled={!canReject || loading}
            onClick={() => onAction(request.uid, 'rejected')}
            className="btn btn-error btn-outline btn-sm gap-1.5"
          >
            <Ban size={14} />
            Refuser
          </button>
          <button
            type="button"
            disabled={!canSuspend || loading}
            onClick={() => onAction(request.uid, 'suspended')}
            className="btn btn-warning btn-outline btn-sm gap-1.5"
          >
            <PauseCircle size={14} />
            Suspendre
          </button>
        </div>
      </div>
    </div>
  );
}
