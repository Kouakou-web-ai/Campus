import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirection en fonction du rôle s'il est connecté mais n'a pas les droits pour cette section
    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Navigate to="/app/super-admin" replace />;
      case 'UNIVERSITY_ADMIN':
        return <Navigate to="/app/admin" replace />;
      case 'FINANCE_MANAGER':
        return <Navigate to="/app/admin/finance" replace />;
      case 'STUDENT_MANAGER':
        return <Navigate to="/app/admin/etudiants" replace />;
      case 'TEACHER_MANAGER':
        return <Navigate to="/app/admin/enseignants" replace />;
      case 'TEACHER':
        return <Navigate to="/app/enseignant" replace />;
      case 'STUDENT':
        return <Navigate to="/app/etudiant" replace />;
      case 'PARENT':
        return <Navigate to="/app/parent" replace />;
      default:
        return <Navigate to="/connexion" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
