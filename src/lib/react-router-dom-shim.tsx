'use client';

import React, { createContext, useContext, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';

// <Link to="..."> -> <NextLink href="...">
export const Link = React.forwardRef<HTMLAnchorElement, any>(({ to, ...props }, ref) => {
  const href = to || '#';
  return <NextLink href={href} {...props} ref={ref} />;
});
Link.displayName = 'Link';

// useNavigate()
export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else if (to === 1) router.forward();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

// useLocation()
export function useLocation() {
  const pathname = usePathname() || '';
  const searchParams = useNextSearchParams();
  const search = searchParams ? `?${searchParams.toString()}` : '';
  return {
    pathname,
    search,
    state: null,
    hash: '',
  };
}

// useSearchParams()
export function useSearchParams() {
  const searchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const setSearchParams = (newParams: any) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    for (const [key, value] of Object.entries(newParams)) {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return [searchParams || new URLSearchParams(), setSearchParams] as const;
}

// <Navigate to="..." replace />
export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, replace]);
  return null;
}

// OutletContext and OutletProvider for layout wrapping
const OutletContext = createContext<React.ReactNode>(null);

export function OutletProvider({ children, layout: Layout }: { children: React.ReactNode; layout: React.ComponentType<any> }) {
  return (
    <OutletContext.Provider value={children}>
      <Layout />
    </OutletContext.Provider>
  );
}

export function Outlet() {
  const context = useContext(OutletContext);
  return <>{context}</>;
}

// Dummies for routing packages/configs
export function BrowserRouter({ children }: any) { return <>{children}</>; }
export function Routes({ children }: any) { return <>{children}</>; }
export function Route({ element }: any) { return <>{element}</>; }
