'use client';

import { useEffect, useState } from 'react';

type BookingRow = {
  phone: string;
  bookingsCount: number;
  totalPeople: number;
  totalSpent: number;
  pendingPayments: number;
};

export default function AdminBookingsPage() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/bookings/summary')
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) setError(data.error);
        else setRows(data.rows || []);
      })
      .catch(() => setError('Failed to load bookings summary'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 text-sm text-white/90">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Bookings Overview</h1>
          <p className="text-xs text-white/60">
            Per-customer event bookings, spend, and pending payments.
          </p>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {loading && !error && (
        <p className="text-xs text-white/60">Loading bookings…</p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-xs text-white/60">No bookings found.</p>
      )}

      {!loading && rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/60">
          <table className="min-w-full text-left text-xs text-white/80">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.16em] text-white/40">
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2 text-right">Bookings</th>
                <th className="px-3 py-2 text-right">People</th>
                <th className="px-3 py-2 text-right">Spent (₹)</th>
                <th className="px-3 py-2 text-right">Pending (₹)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.phone} className="border-b border-white/5 last:border-0">
                  <td className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-white">
                        +91 {row.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-[11px]">
                    {row.bookingsCount}
                  </td>
                  <td className="px-3 py-2 text-right text-[11px]">
                    {row.totalPeople}
                  </td>
                  <td className="px-3 py-2 text-right text-[11px] text-emerald-300">
                    {row.totalSpent}
                  </td>
                  <td className="px-3 py-2 text-right text-[11px] text-amber-300">
                    {row.pendingPayments}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

