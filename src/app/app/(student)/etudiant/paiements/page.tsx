'use client';

import dynamic from 'next/dynamic';

const Paiements = dynamic(() => import('../../../../../_pages/student/Paiements'), { ssr: false });

export default function RoutePage() {
  return <Paiements />;
}
