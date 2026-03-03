export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

export async function GET() {
  try {
    const current = getCurrentCustomer();
    if (!current?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: current.userId },
    });
    if (!user) {
      return NextResponse.json(
        { bookings: [], coupons: { active: [], used: [], expired: [] } },
        { status: 200 },
      );
    }

    const [bookings, coupons] = await Promise.all([
      prisma.eventBooking.findMany({
        where: {
          OR: [
            { userId: user.id },
            { userId: null, mobile: current.phone },
          ],
        },
        include: { event: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.coupon.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const active = coupons.filter((c) => c.status === "ACTIVE");
    const used = coupons.filter((c) => c.status === "USED");
    const expired = coupons.filter((c) => c.status === "EXPIRED");

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        eventTitle: b.event?.title ?? null,
        date: b.date,
        people: b.people,
        paymentStatus: b.paymentStatus,
      })),
      coupons: { active, used, expired },
    });
  } catch (e) {
    console.error("[account/overview]", e);
    return NextResponse.json(
      { error: "Could not load account. Please try again." },
      { status: 500 }
    );
  }
}

