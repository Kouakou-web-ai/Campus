'use client';

import dynamic from 'next/dynamic';

const GestionNotes = dynamic(() => import('../../../../../_pages/teacher/GestionNotes'), { ssr: false });

export default function RoutePage() {
  return <HighlightNotes />;
}

function HighlightNotes() {
  return <GestionNotes />;
}
