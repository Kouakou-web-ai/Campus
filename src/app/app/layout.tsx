'use client';

import dynamic from 'next/dynamic';
import { OutletProvider } from '../../lib/react-router-dom-shim';

const ProtectedRoute = dynamic(() => import('../../routes/ProtectedRoute'), { ssr: false });
const AccountStatusGuard = dynamic(() => import('../../routes/AccountStatusGuard'), { ssr: false });
const DashboardLayout = dynamic(() => import('../../layouts/DashboardLayout'), { ssr: false });

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AccountStatusGuard>
        <OutletProvider layout={DashboardLayout}>{children}</OutletProvider>
      </AccountStatusGuard>
    </ProtectedRoute>
  );
}
