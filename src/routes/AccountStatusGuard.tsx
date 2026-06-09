import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { accountStatusPaths } from '../constants/accountStatus';

interface AccountStatusGuardProps {
  children: ReactNode;
}

export default function AccountStatusGuard({ children }: AccountStatusGuardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (user.status !== 'active') {
    return <Navigate to={accountStatusPaths[user.status]} replace />;
  }

  return <>{children}</>;
}
