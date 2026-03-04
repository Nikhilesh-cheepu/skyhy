'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type AdminStats = {
  sections: number;
  categories: number;
  menuItems: number;
  galleryImages: number;
  totalBills: number;
  paidBills: number;
  pendingBills: number;
  totalBillAmount: number;
  activeEvents: number;
  totalBookings: number;
  pendingBookings: number;
  totalBookingRevenue: number;
  whatsappClicks: number;
  callClicks: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 text-sm text-white/90">
      <div>
        <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
        <p className="text-xs text-white/60">
          Overview of SKYHY performance with shortcuts to key tools.
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && !error && (
        <p className="text-xs text-white/60">Loading dashboard…</p>
      )}

      {stats && (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-3 shadow-lg">
              <p className="text-[11px] text-white/50">Menu items</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {stats.menuItems}
              </p>
              <p className="mt-1 text-[11px] text-white/60">
                {stats.sections} sections • {stats.categories} categories
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#022c22] to-[#065f46] p-3 shadow-lg">
              <p className="text-[11px] text-emerald-100/80">Bills (₹)</p>
              <p className="mt-1 text-lg font-semibold text-emerald-200">
                {stats.totalBillAmount}
              </p>
              <p className="mt-1 text-[11px] text-emerald-100/80">
                {stats.paidBills} paid • {stats.pendingBills} pending
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#172554] to-[#1d4ed8] p-3 shadow-lg">
              <p className="text-[11px] text-indigo-100/80">Event bookings</p>
              <p className="mt-1 text-lg font-semibold text-indigo-100">
                {stats.totalBookings}
              </p>
              <p className="mt-1 text-[11px] text-indigo-100/80">
                ₹{stats.totalBookingRevenue} paid • {stats.pendingBookings} pending
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#111827] to-[#020617] p-3 shadow-lg">
              <p className="text-[11px] text-white/50">Reach Us clicks</p>
              <p className="mt-1 text-lg font-semibold text-white">
                {stats.whatsappClicks + stats.callClicks}
              </p>
              <p className="mt-1 text-[11px] text-white/60">
                WhatsApp {stats.whatsappClicks} • Calls {stats.callClicks}
              </p>
            </div>
          </div>

          {/* Navigation cards */}
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link
              href="/admin/menu"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Menu
                </p>
                <p className="mt-1 text-sm font-semibold">Manage menu items</p>
                <p className="text-[11px] text-white/60">
                  Add, edit, and hide items from the customer menu.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>

            <Link
              href="/admin/bills"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Bills
                </p>
                <p className="mt-1 text-sm font-semibold">Create & view bills</p>
                <p className="text-[11px] text-white/60">
                  Generate payment links and review bill history.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>

            <Link
              href="/admin/menu-images"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Gallery
                </p>
                <p className="mt-1 text-sm font-semibold">Home gallery images</p>
                <p className="text-[11px] text-white/60">
                  {stats.galleryImages} images in the home gallery carousel.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>

            <Link
              href="/admin/events"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Events
                </p>
                <p className="mt-1 text-sm font-semibold">Events carousel</p>
                <p className="text-[11px] text-white/60">
                  {stats.activeEvents} active events shown on the events page.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>

            <Link
              href="/admin/bookings"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Bookings
                </p>
                <p className="mt-1 text-sm font-semibold">Customer bookings</p>
                <p className="text-[11px] text-white/60">
                  See per-customer bookings, spend, and pending payments.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>

            <Link
              href="/admin/logout"
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                  Session
                </p>
                <p className="mt-1 text-sm font-semibold">Log out</p>
                <p className="text-[11px] text-white/60">
                  Securely sign out from the admin panel.
                </p>
              </div>
              <span className="text-lg">↗</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

