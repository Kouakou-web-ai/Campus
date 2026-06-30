'use client';

import dynamic from 'next/dynamic';

const AccountStatusRoute = dynamic(() => import('../../../routes/AccountStatusRoute'), { ssr: false });
const AccountRejectedPage = dynamic(() => import('../../../_pages/account/AccountRejectedPage'), { ssr: false });

export default function RoutePage() {
  return (
    <AccountStatusRoute requiredStatus="rejected">
      <AccountRejectedPage />
    </AccountStatusRoute>
  );
}
