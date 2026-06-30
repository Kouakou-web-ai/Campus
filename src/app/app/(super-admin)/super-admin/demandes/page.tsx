'use client';

import dynamic from 'next/dynamic';

const DemandesAdministrateurs = dynamic(() => import('../../../../../_pages/super-admin/DemandesAdministrateurs'), { ssr: false });

export default function RoutePage() {
  return <DemandesAdministrateurs />;
}
