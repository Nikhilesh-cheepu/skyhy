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

    // Coupon availability status for today's FCFS discount (per dayKey, 30/day)
    let couponStatusToday: "available" | "used_today" | "sold_out" | "unknown" =
      "unknown";
    try {
      const now = new Date();
      const istOffsetMs = 5.5 * 60 * 60 * 1000;
      const istNow = new Date(now.getTime() + istOffsetMs);
      const dayKey = istNow.toISOString().slice(0, 10); // YYYY-MM-DD in IST

      const [existingUserClaim, dayRow, activeHeldCount] = await Promise.all([
        prisma.couponClaim.findFirst({
          where: {
            dayKey,
            userId: user.id,
            status: { in: ["HELD", "USED"] },
          },
        }),
        prisma.couponDay.findUnique({
          where: { dayKey },
        }),
        prisma.couponClaim.count({
          where: {
            dayKey,
            status: "HELD",
            holdExpiresAt: { gte: now },
          },
        }),
      ]);

      if (existingUserClaim) {
        couponStatusToday = "used_today";
      } else {
        const issuedCount = dayRow?.issuedCount ?? 0;
        const QUOTA_PER_DAY = 30;
        const availability = QUOTA_PER_DAY - issuedCount - activeHeldCount;
        couponStatusToday = availability > 0 ? "available" : "sold_out";
      }
    } catch {
      couponStatusToday = "unknown";
    }

    return NextResponse.json({
      bookings: bookings.map((b) => ({
        id: b.id,
        eventTitle: b.event?.title ?? null,
        date: b.date,
        time: b.time,
        people: b.people,
        paymentStatus: b.paymentStatus,
      })),
      coupons: { active, used, expired },
      couponStatusToday,
    });
  } catch (e) {
    console.error("[account/overview]", e);
    return NextResponse.json(
      { error: "Could not load account. Please try again." },
      { status: 500 }
    );
  }
}

