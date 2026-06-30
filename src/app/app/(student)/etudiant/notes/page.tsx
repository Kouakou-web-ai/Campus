'use client';

import dynamic from 'next/dynamic';

const ResultatsAcademiques = dynamic(() => import('../../../../../_pages/student/ResultatsAcademiques'), { ssr: false });

export default function RoutePage() {
  return <ResultatsAcademiques />;
}
