'use client';

import dynamic from 'next/dynamic';

const ContactPage = dynamic(() => import('../../../_pages/public/ContactPage'), { ssr: false });

export default function RoutePage() {
  return <ContactPage />;
}
