'use client';

import dynamic from 'next/dynamic';

const AccountStatusRoute = dynamic(() => import('../../../routes/AccountStatusRoute'), { ssr: false });
const AccountPendingPage = dynamic(() => import('../../../_pages/account/AccountPendingPage'), { ssr: false });

export default function RoutePage() {
  return (
    <AccountStatusRoute requiredStatus="pending">
      <AccountPendingPage />
    </AccountStatusRoute>
  );
}
