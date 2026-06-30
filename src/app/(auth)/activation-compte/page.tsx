'use client';

import dynamic from 'next/dynamic';

const ActivationComptePage = dynamic(() => import('../../../_pages/public/ActivationComptePage'), { ssr: false });

export default function RoutePage() {
  return <ActivationComptePage />;
}
