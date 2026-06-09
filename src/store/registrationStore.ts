import { create } from 'zustand';
import { useAuthStore, type UserRole } from './authStore';
import { auth } from '../../firebase-config';
import type { RegistrationRequest, UserStatus } from '../types/userAccount';
import {
  subscribeToUsers,
  updateUserStatus as updateUserStatusApi,
} from '../services/registrationService';
import { mockUniversities } from '../constants/mockData';
import { ToastError, ToastSuccess } from '../controllers/Toast-emitter';

interface RegistrationState {
  requests: RegistrationRequest[];
  loading: boolean;
  actionLoading: string | null;
  unsubscribe: (() => void) | null;
  subscribe: () => void;
  teardown: () => void;
  setUserStatus: (uid: string, status: UserStatus) => Promise<void>;
  getAdminRequests: () => RegistrationRequest[];
  getUniversityRequests: (universityId: string, role: UserRole) => RegistrationRequest[];
}

function withUniversityNames(users: RegistrationRequest[]): RegistrationRequest[] {
  return users.map((user) => ({
    ...user,
    universityName:
      mockUniversities.find((u) => u.id === user.universityId)?.name ??
      user.universityId ??
      '—',
  }));
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  requests: [],
  loading: true,
  actionLoading: null,
  unsubscribe: null,

  subscribe: () => {
    if (get().unsubscribe) return;

    set({ loading: true });
    const unsub = subscribeToUsers((users) => {
      set({ requests: withUniversityNames(users), loading: false });
    });
    set({ unsubscribe: unsub });
  },

  teardown: () => {
    get().unsubscribe?.();
    set({ unsubscribe: null, requests: [], loading: true });
  },

  setUserStatus: async (uid, status) => {
    set({ actionLoading: uid });
    try {
      await updateUserStatusApi(uid, status);
      const messages: Record<UserStatus, string> = {
        active: 'Compte validé avec succès.',
        rejected: 'Demande refusée.',
        suspended: 'Compte suspendu.',
        pending: 'Compte remis en attente.',
      };
      ToastSuccess(messages[status]);

      // Si c'est en mode démo ou si la session Firebase est absente,
      // on applique le changement de statut en local pour mettre à jour l'interface
      const isDemo = useAuthStore.getState().user?.id.startsWith('usr-') || !auth.currentUser;
      if (isDemo) {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.uid === uid ? { ...r, status } : r
          ),
        }));
      }
    } catch (err) {
      console.error(err);
      ToastError("Impossible de mettre à jour le statut du compte.");
      throw err;
    } finally {
      set({ actionLoading: null });
    }
  },

  getAdminRequests: () =>
    get().requests.filter((r) => r.role === 'UNIVERSITY_ADMIN'),

  getUniversityRequests: (universityId, role) =>
    get().requests.filter(
      (r) => r.universityId === universityId && r.role === role,
    ),
}));
