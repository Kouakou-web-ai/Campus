'use client';

import dynamic from 'next/dynamic';

const FAQPage = dynamic(() => import('../../../_pages/public/FAQPage'), { ssr: false });

export default function RoutePage() {
  return <FAQPage />;
}
