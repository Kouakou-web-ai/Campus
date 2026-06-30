'use client';

import dynamic from 'next/dynamic';
import { OutletProvider } from '../../lib/react-router-dom-shim';

const AuthLayout = dynamic(() => import('../../layouts/AuthLayout'), { ssr: false });

export default function Layout({ children }: { children: React.ReactNode }) {
  return <OutletProvider layout={AuthLayout}>{children}</OutletProvider>;
}
