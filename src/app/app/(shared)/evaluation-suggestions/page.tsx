'use client';

import dynamic from 'next/dynamic';

const EvaluationSuggestions = dynamic(() => import('../../../../_pages/shared/EvaluationSuggestions'), { ssr: false });

export default function RoutePage() {
  return <EvaluationSuggestions />;
}
