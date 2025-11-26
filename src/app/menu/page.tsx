'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MenuPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to packages-menu page with menu tab
    router.replace('/packages-menu?tab=menu');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white">Redirecting to Packages & Menu...</p>
    </div>
  );
}
