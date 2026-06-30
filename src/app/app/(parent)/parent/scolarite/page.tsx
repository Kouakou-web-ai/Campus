'use client';

import dynamic from 'next/dynamic';

const Scolarite = dynamic(() => import('../../../../../_pages/parent/Scolarite'), { ssr: false });

export default function RoutePage() {
  return <Scolarite />;
}
