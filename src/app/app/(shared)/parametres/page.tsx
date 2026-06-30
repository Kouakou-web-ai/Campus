'use client';

import dynamic from 'next/dynamic';

const ParametresProfil = dynamic(() => import('../../../../_pages/shared/ParametresProfil'), { ssr: false });

export default function RoutePage() {
  return <ParametresProfil />;
}
