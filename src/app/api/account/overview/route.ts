export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

export async function GET() {
  try {
    const current = getCurrentCustomer();
    if (!current?.phone) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { phone: current.phone },
    });
    if (!user) {
      return NextResponse.json(
        { bookings: [], coupon: null },
        { status: 200 },
      );
    }

    const [bookings, coupon] = await Promise.all([
      prisma.eventBooking.findMany({
        where: { mobile: current.phone },
        include: { event: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.coupon.findFirst({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        eventTitle: b.event?.title ?? null,
        date: b.date,
        people: b.people,
        paymentStatus: b.paymentStatus,
      })),
      coupon,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to load account overview";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

