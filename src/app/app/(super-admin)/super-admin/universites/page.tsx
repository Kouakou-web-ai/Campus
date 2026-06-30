'use client';

import dynamic from 'next/dynamic';

const SurveillanceUniversites = dynamic(() => import('../../../../../_pages/super-admin/SurveillanceUniversites'), { ssr: false });

export default function RoutePage() {
  return <SurveillanceUniversites />;
}
