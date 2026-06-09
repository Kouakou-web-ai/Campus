import { useEffect, useState } from 'react';
import { Users, GraduationCap, UserRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import { RegistrationRequestsGrid } from '../../components/registration/RegistrationRequestsTable';
import { useRegistrationStore } from '../../store/registrationStore';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../store/authStore';

type TabKey = 'STUDENT' | 'TEACHER' | 'PARENT';

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'STUDENT', label: 'Étudiants', icon: Users },
  { key: 'TEACHER', label: 'Enseignants', icon: GraduationCap },
  { key: 'PARENT', label: 'Parents', icon: UserRound },
];

export default function DemandesInscription() {
  const [activeTab, setActiveTab] = useState<TabKey>('STUDENT');
  const { user } = useAuthStore();
  const {
    loading,
    actionLoading,
    subscribe,
    teardown,
    getUniversityRequests,
    setUserStatus,
  } = useRegistrationStore();

  useEffect(() => {
    subscribe();
    return () => teardown();
  }, [subscribe, teardown]);

  const universityId = user?.universityId ?? '';
  const requests = getUniversityRequests(universityId, activeTab as UserRole);
  const pendingCount = TABS.reduce((acc, tab) => {
    return acc + getUniversityRequests(universityId, tab.key).filter((r) => r.status === 'pending').length;
  }, 0);

  if (loading) {
    return <LoadingState type="page" />;
  }

  return (
    <div className="page-transition space-y-6">
      <PageHeader
        title="Demandes d'inscription"
        description="Gérez les demandes d'accès des étudiants, enseignants et parents de votre université."
        action={
          pendingCount > 0 ? (
            <span className="badge badge-warning badge-lg">{pendingCount} en attente</span>
          ) : undefined
        }
      />

      <div role="tablist" className="tabs tabs-boxed bg-surface-raised p-1 w-full max-w-xl">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={`tab flex-1 gap-2 ${activeTab === key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <RegistrationRequestsGrid
        requests={requests}
        actionLoading={actionLoading}
        onAction={setUserStatus}
      />
    </div>
  );
}
