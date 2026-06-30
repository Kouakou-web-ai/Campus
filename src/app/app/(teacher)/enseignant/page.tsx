'use client';

import dynamic from 'next/dynamic';

const TeacherDashboard = dynamic(
  () => import('../../../../_pages/teacher/Dashboard').then(m => m.TeacherDashboard),
  { ssr: false }
);

export default function RoutePage() {
  return <TeacherDashboard />;
}
