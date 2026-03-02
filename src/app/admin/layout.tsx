import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0C1222] text-[#E7ECF2]">
      <header className="border-b border-white/10 bg-black/20 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-semibold text-[#4A90E2]">
            Admin
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="hover:text-[#4A90E2]">
              Menu
            </Link>
            <Link href="/admin/offers" className="hover:text-[#4A90E2]">
              Offers
            </Link>
            <Link href="/admin/events" className="hover:text-[#4A90E2]">
              Events
            </Link>
            <Link href="/admin/menu-images" className="hover:text-[#4A90E2]">
              Menu Images
            </Link>
            <Link href="/admin/categories" className="hover:text-[#4A90E2]">
              Categories
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/admin/logout" className="hover:text-[#FCA5A5] text-white/80">
              Logout
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

