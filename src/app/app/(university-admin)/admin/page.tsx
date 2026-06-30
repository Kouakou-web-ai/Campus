'use client';

import dynamic from 'next/dynamic';

const TableauDeBord = dynamic(() => import('../../../../_pages/university-admin/TableauDeBord'), { ssr: false });

export default function RoutePage() {
  return <TableauDeBord />;
}
