'use client';

import dynamic from 'next/dynamic';

const GestionCours = dynamic(() => import('../../../../../_pages/university-admin/GestionCours'), { ssr: false });

export default function RoutePage() {
  return <GestionCours />;
}
