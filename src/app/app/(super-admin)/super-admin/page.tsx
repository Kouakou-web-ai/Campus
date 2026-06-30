'use client';

import dynamic from 'next/dynamic';

const TableauDeBord = dynamic(() => import('../../../../_pages/super-admin/TableauDeBord'), { ssr: false });

export default function RoutePage() {
  return <TableauDeBord />;
}
