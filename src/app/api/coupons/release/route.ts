export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

export async function POST(request: Request) {
  try {
    const current = getCurrentCustomer();
    if (!current?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const billId = typeof body?.billId === "string" ? body.billId.trim() || undefined : undefined;
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() || undefined : undefined;

    if (!billId && !orderId) {
      return NextResponse.json(
        { error: "billId or orderId is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const where = billId
      ? { billId, userId: current.userId, status: "HELD" as const }
      : { orderId, userId: current.userId, status: "HELD" as const };

    const updated = await prisma.couponClaim.updateMany({
      where,
      data: { status: "RELEASED" },
    });

    return NextResponse.json({
      released: updated.count > 0,
    });
  } catch (e) {
    console.error("[coupons/release]", e);
    return NextResponse.json(
      { error: "Could not release coupon. Please try again." },
      { status: 500 }
    );
  }
}
