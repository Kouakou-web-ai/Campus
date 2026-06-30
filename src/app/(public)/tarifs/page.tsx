'use client';

import dynamic from 'next/dynamic';

const PrixPage = dynamic(() => import('../../../_pages/public/PrixPage'), { ssr: false });

export default function RoutePage() {
  return <PrixPage />;
}
