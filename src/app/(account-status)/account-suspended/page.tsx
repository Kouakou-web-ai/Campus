'use client';

import dynamic from 'next/dynamic';

const AccountStatusRoute = dynamic(() => import('../../../routes/AccountStatusRoute'), { ssr: false });
const AccountSuspendedPage = dynamic(() => import('../../../_pages/account/AccountSuspendedPage'), { ssr: false });

export default function RoutePage() {
  return (
    <AccountStatusRoute requiredStatus="suspended">
      <AccountSuspendedPage />
    </AccountStatusRoute>
  );
}
