'use client';

import dynamic from 'next/dynamic';

const SuiviAcademique = dynamic(() => import('../../../../../_pages/parent/SuiviAcademique'), { ssr: false });

export default function RoutePage() {
  return <SuiviAcademique />;
}
