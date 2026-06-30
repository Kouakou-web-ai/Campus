'use client';

import dynamic from 'next/dynamic';

const RoleGuard = dynamic(() => import('../../../routes/RoleGuard'), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['TEACHER']}>{children}</RoleGuard>;
}
