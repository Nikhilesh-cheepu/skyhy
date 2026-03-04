'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <SiteHeader />}
      <div className={isAdmin ? '' : 'pt-16 md:pt-24'}>{children}</div>
    </>
  );
}

