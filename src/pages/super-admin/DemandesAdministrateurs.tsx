import { useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import RegistrationRequestsTable from '../../components/registration/RegistrationRequestsTable';
import { useRegistrationStore } from '../../store/registrationStore';

export default function DemandesAdministrateurs() {
  const {
    loading,
    actionLoading,
    subscribe,
    teardown,
    getAdminRequests,
    setUserStatus,
  } = useRegistrationStore();

  useEffect(() => {
    subscribe();
    return () => teardown();
  }, [subscribe, teardown]);

  const requests = getAdminRequests();
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (loading) {
    return <LoadingState type="page" />;
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Demandes Administrateurs"
        description="Validez ou refusez les demandes d'accès administrateur universitaire."
        action={
          pendingCount > 0 ? (
            <span className="badge badge-warning badge-lg gap-2">
              <UserCheck size={14} />
              {pendingCount} en attente
            </span>
          ) : undefined
        }
      />

      <RegistrationRequestsTable
        requests={requests}
        showUniversity
        actionLoading={actionLoading}
        onAction={setUserStatus}
      />
    </div>
  );
}
