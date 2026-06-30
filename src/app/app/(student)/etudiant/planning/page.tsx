'use client';

import dynamic from 'next/dynamic';

const EmploiDuTemps = dynamic(() => import('../../../../../_pages/student/EmploiDuTemps'), { ssr: false });

export default function RoutePage() {
  return <EmploiDuTemps />;
}
