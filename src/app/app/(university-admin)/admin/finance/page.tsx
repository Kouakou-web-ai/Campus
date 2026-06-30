'use client';

import dynamic from 'next/dynamic';

const CentreFinancier = dynamic(() => import('../../../../../_pages/university-admin/CentreFinancier'), { ssr: false });

export default function RoutePage() {
  return <CentreFinancier />;
}
