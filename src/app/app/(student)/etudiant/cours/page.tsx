'use client';

import dynamic from 'next/dynamic';

const PortailApprentissage = dynamic(() => import('../../../../../_pages/student/PortailApprentissage'), { ssr: false });

export default function RoutePage() {
  return <PortailApprentissage />;
}
