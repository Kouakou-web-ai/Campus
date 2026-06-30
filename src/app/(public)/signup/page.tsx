'use client';

import dynamic from 'next/dynamic';

const InscriptionPage = dynamic(() => import('../../../_pages/public/InscriptionPage'), { ssr: false });

export default function RoutePage() {
  return <InscriptionPage />;
}
