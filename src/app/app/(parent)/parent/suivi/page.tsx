'use client';

import dynamic from 'next/dynamic';

const SuiviEnfant = dynamic(() => import('../../../../../_pages/parent/SuiviEnfant'), { ssr: false });

export default function RoutePage() {
  return <SuiviEnfant />;
}
