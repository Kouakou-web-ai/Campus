'use client';

import dynamic from 'next/dynamic';

const GestionEtudiants = dynamic(() => import('../../../../../_pages/university-admin/GestionEtudiants'), { ssr: false });

export default function RoutePage() {
  return <GestionEtudiants />;
}
