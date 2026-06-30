'use client';

import dynamic from 'next/dynamic';

const PublicationDevoirs = dynamic(() => import('../../../../../_pages/teacher/PublicationDevoirs'), { ssr: false });

export default function RoutePage() {
  return <PublicationDevoirs />;
}
