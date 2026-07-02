import { useMemo } from 'react';
import { Inbox, Trash2 } from 'lucide-react';
import type { UserRole } from '../../store/authStore';
import type { RegistrationRequest, UserStatus } from '../../types/userAccount';
import RegistrationRequestCard from './RegistrationRequestCard';
import UserStatusBadge from './UserStatusBadge';
import EmptyState from '../ui/EmptyState';

interface RegistrationRequestsTableProps {
  requests: RegistrationRequest[];
  showUniversity?: boolean;
  actionLoading: string | null;
  onAction: (uid: string, status: UserStatus) => void;
  onDelete?: (uid: string) => void;
}

export default function RegistrationRequestsTable({
  requests,
  showUniversity = false,
  actionLoading,
  onAction,
  onDelete,
}: RegistrationRequestsTableProps) {
  const sorted = useMemo(
    () =>
      [...requests].sort(
        (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      ),
    [requests],
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune demande"
        description="Il n'y a pas de demande d'inscription à traiter pour le moment."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-subtle">
      <table className="table table-zebra">
        <thead>
          <tr className="text-content-muted">
            <th>Prénom</th>
            <th>Nom</th>
            <th>Email</th>
            {showUniversity && <th>Université</th>}
            <th>Date d'inscription</th>
            <th>Statut</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((request) => (
            <RegistrationRequestRow
              key={request.uid}
              request={request}
              showUniversity={showUniversity}
              loading={actionLoading === request.uid}
              onAction={onAction}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegistrationRequestRow({
  request,
  showUniversity,
  loading,
  onAction,
  onDelete,
}: {
  request: RegistrationRequest;
  showUniversity: boolean;
  loading: boolean;
  onAction: RegistrationRequestsTableProps['onAction'];
  onDelete: RegistrationRequestsTableProps['onDelete'];
}) {
  const date = new Date(request.createdDate).toLocaleDateString('fr-FR');

  return (
    <tr>
      <td className="font-medium text-content">{request.prenom}</td>
      <td className="text-content">{request.nom}</td>
      <td className="text-content-secondary">{request.email}</td>
      {showUniversity && <td className="text-xs text-content-secondary">{request.universityName}</td>}
      <td className="text-content-secondary">{date}</td>
      <td>
        <UserStatusBadge status={request.status} />
      </td>
      <td>
        <div className="flex justify-end gap-1 flex-wrap">
          {request.status !== 'active' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onAction(request.uid, 'active')}
              className="btn btn-success btn-xs"
            >
              Valider
            </button>
          )}
          {request.status !== 'active' && request.status !== 'rejected' && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onAction(request.uid, 'rejected')}
              className="btn btn-error btn-outline btn-xs"
            >
              Refuser
            </button>
          )}
          {(request.status === 'active' || request.status === 'pending') && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onAction(request.uid, 'suspended')}
              className="btn btn-warning btn-outline btn-xs"
            >
              Suspendre
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce compte ?")) {
                  onDelete(request.uid);
                }
              }}
              className="btn btn-error btn-xs flex items-center gap-1"
            >
              <Trash2 size={12} />
              Supprimer
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export function RegistrationRequestsGrid({
  requests,
  showUniversity,
  actionLoading,
  onAction,
  onDelete,
}: RegistrationRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune demande"
        description="Il n'y a pas de demande d'inscription à traiter pour le moment."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {requests.map((request) => (
        <RegistrationRequestCard
          key={request.uid}
          request={request}
          showUniversity={showUniversity}
          loading={actionLoading === request.uid}
          onAction={onAction}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export function filterByRole(requests: RegistrationRequest[], role: UserRole) {
  return requests.filter((r) => r.role === role);
}
