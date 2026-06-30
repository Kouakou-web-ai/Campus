'use client';

import dynamic from 'next/dynamic';

const NotFoundPage = dynamic(() => import('../_pages/NotFoundPage'), { ssr: false });

export default function NotFound() {
  return <NotFoundPage />;
}
