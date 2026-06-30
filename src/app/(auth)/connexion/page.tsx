'use client';

import dynamic from 'next/dynamic';

const ConnexionPage = dynamic(() => import('../../../_pages/public/ConnexionPage'), { ssr: false });

export default function RoutePage() {
  return <ConnexionPage />;
}
