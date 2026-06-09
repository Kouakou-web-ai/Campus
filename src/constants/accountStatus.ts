import type { User } from '../store/authStore';
import type { UserStatus } from '../types/userAccount';
import { roleDashboardPath } from './navigation';

export const accountStatusPaths: Record<UserStatus, string> = {
  pending: '/account-pending',
  active: '',
  rejected: '/account-rejected',
  suspended: '/account-suspended',
};

export const accountStatusLabels: Record<UserStatus, string> = {
  pending: 'En attente',
  active: 'Actif',
  rejected: 'Refusé',
  suspended: 'Suspendu',
};

export function getPostLoginPath(user: User): string {
  if (user.status !== 'active') {
    return accountStatusPaths[user.status];
  }
  return roleDashboardPath[user.role];
}

export function normalizeUserStatus(status?: string | null): UserStatus {
  if (status === 'pending' || status === 'active' || status === 'rejected' || status === 'suspended') {
    return status;
  }
  return 'active';
}
