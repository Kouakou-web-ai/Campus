import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { accountStatusPaths, getPostLoginPath } from '../constants/accountStatus';
import type { UserStatus } from '../types/userAccount';

interface AccountStatusRouteProps {
  requiredStatus: UserStatus;
  children: ReactNode;
}

export default function AccountStatusRoute({ requiredStatus, children }: AccountStatusRouteProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.status === 'active') {
    return <Navigate to={getPostLoginPath(user)} replace />;
  }

  if (user.status !== requiredStatus) {
    return <Navigate to={accountStatusPaths[user.status]} replace />;
  }

  return <>{children}</>;
}
