'use client';

import dynamic from 'next/dynamic';

const AnalytiquesRevenu = dynamic(() => import('../../../../../_pages/super-admin/AnalytiquesRevenu'), { ssr: false });

export default function RoutePage() {
  return <AnalytiquesRevenu />;
}
