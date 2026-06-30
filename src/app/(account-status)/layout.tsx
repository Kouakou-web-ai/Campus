'use client';

import dynamic from 'next/dynamic';
import { OutletProvider } from '../../lib/react-router-dom-shim';

const ProtectedRoute = dynamic(() => import('../../routes/ProtectedRoute'), { ssr: false });
const AccountStatusLayout = dynamic(() => import('../../layouts/AccountStatusLayout'), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <OutletProvider layout={AccountStatusLayout}>{children}</OutletProvider>
    </ProtectedRoute>
  );
}
