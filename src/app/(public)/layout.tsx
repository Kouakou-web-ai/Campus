'use client';

import dynamic from 'next/dynamic';
import { OutletProvider } from '../../lib/react-router-dom-shim';

const PublicLayout = dynamic(() => import('../../layouts/PublicLayout'), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OutletProvider layout={PublicLayout}>{children}</OutletProvider>;
}
