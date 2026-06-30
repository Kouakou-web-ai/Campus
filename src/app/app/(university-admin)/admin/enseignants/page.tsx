'use client';

import dynamic from 'next/dynamic';

const GestionEnseignants = dynamic(() => import('../../../../../_pages/university-admin/GestionEnseignants'), { ssr: false });

export default function RoutePage() {
  return <GestionEnseignants />;
}
