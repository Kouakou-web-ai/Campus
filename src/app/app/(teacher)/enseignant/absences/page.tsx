'use client';

import dynamic from 'next/dynamic';

const GestionAbsences = dynamic(() => import('../../../../../_pages/teacher/GestionAbsences'), { ssr: false });

export default function RoutePage() {
  return <GestionAbsences />;
}
