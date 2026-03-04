export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();
    const bookings = await prisma.eventBooking.findMany({
      select: {
        mobile: true,
        people: true,
        ticketPrice: true,
        paymentStatus: true,
      },
    });

    type Row = {
      phone: string;
      bookingsCount: number;
      totalPeople: number;
      totalSpent: number;
      pendingPayments: number;
    };

    const byPhone = new Map<string, Row>();
    for (const b of bookings) {
      const phone = b.mobile;
      if (!phone) continue;
      const key = phone;
      const existing =
        byPhone.get(key) ??
        {
          phone,
          bookingsCount: 0,
          totalPeople: 0,
          totalSpent: 0,
          pendingPayments: 0,
        };
      existing.bookingsCount += 1;
      existing.totalPeople += b.people;
      const value = (b.ticketPrice ?? 0) * b.people;
      if (b.paymentStatus === "PAID") {
        existing.totalSpent += value;
      } else {
        existing.pendingPayments += value;
      }
      byPhone.set(key, existing);
    }

    const rows = Array.from(byPhone.values()).sort(
      (a, b) => b.totalSpent - a.totalSpent,
    );

    return NextResponse.json({ rows });
  } catch (e) {
    console.error("[admin/bookings/summary]", e);
    const message =
      e instanceof Error ? e.message : "Failed to fetch bookings summary";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

