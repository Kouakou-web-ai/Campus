'use client';

import dynamic from 'next/dynamic';

const LandingPage = dynamic(() => import('../../_pages/public/LandingPage'), { ssr: false });

export default function RoutePage() {
  return <LandingPage />;
}
