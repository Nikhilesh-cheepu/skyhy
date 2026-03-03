export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

const HOLD_MINUTES = 5;
const DISCOUNT_PERCENT = 25;
const QUOTA_PER_DAY = 30;

function getTodayDayKeyIST(): string {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  return ist.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const current = getCurrentCustomer();
    if (!current?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const billId = typeof body?.billId === "string" ? body.billId.trim() || undefined : undefined;
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() || undefined : undefined;

    if (billId && orderId) {
      return NextResponse.json(
        { error: "Provide either billId or orderId, not both" },
        { status: 400 }
      );
    }
    if (!billId && !orderId) {
      return NextResponse.json(
        { error: "billId or orderId is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const dayKey = getTodayDayKeyIST();
    const now = new Date();

    let amount: number;
    let entityId: string;

    if (billId) {
      const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include: { user: true },
      });
      if (!bill) {
        return NextResponse.json({ error: "Bill not found" }, { status: 404 });
      }
      if (bill.userId !== current.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (bill.status !== "PENDING") {
        return NextResponse.json(
          { error: "Bill is not pending" },
          { status: 400 }
        );
      }
      if (bill.billType !== "a_la_carte") {
        return NextResponse.json(
          { error: "25% discount only applies to À la carte bills (not 128-only)" },
          { status: 400 }
        );
      }
      amount = bill.amount;
      entityId = billId;
    } else {
      const order = await prisma.order.findUnique({
        where: { id: orderId! },
        include: { items: true },
      });
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      if (order.userId !== current.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (order.status !== "PENDING") {
        return NextResponse.json(
          { error: "Order is not pending" },
          { status: 400 }
        );
      }
      const hasNon128Items = order.items.some((i) => i.price !== 128);
      if (!hasNon128Items) {
        return NextResponse.json(
          { error: "25% discount only when order has À la carte items (not 128-only)" },
          { status: 400 }
        );
      }
      amount = order.totalAmount;
      entityId = orderId!;
    }
    const holdExpiresAt = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const claimData = billId
        ? { billId, orderId: null as string | null }
        : { billId: null as string | null, orderId: entityId };
      await tx.couponClaim.updateMany({
        where: {
          status: "HELD",
          holdExpiresAt: { lt: now },
        },
        data: { status: "RELEASED" },
      });

      const existingUserClaim = await tx.couponClaim.findFirst({
        where: {
          dayKey,
          userId: current.userId,
          status: { in: ["HELD", "USED"] },
        },
      });
      if (existingUserClaim) {
        return {
          success: false,
          error: "already_used_today",
          message: "Coupon already applied for you for this day. Please try again after 24 hours.",
        };
      }

      const dayRow = await tx.couponDay.upsert({
        where: { dayKey },
        create: { dayKey, issuedCount: 0 },
        update: {},
      });

      const activeHeldCount = await tx.couponClaim.count({
        where: {
          dayKey,
          status: "HELD",
          holdExpiresAt: { gte: now },
        },
      });

      const availability =
        QUOTA_PER_DAY - dayRow.issuedCount - activeHeldCount;
      if (availability <= 0) {
        return {
          success: false,
          error: "quota_full",
          message: "No coupons left for today. Please try again tomorrow.",
        };
      }

      const discountAmount = Math.round(
        (amount * DISCOUNT_PERCENT) / 100
      );
      const discount = Math.min(discountAmount, amount);

      const claim = await tx.couponClaim.create({
        data: {
          dayKey,
          userId: current.userId,
          ...claimData,
          status: "HELD",
          holdExpiresAt,
          discountAmount: discount,
          discountPercent: DISCOUNT_PERCENT,
        },
      });

      return {
        success: true,
        claimId: claim.id,
        discount,
        discountPercent: DISCOUNT_PERCENT,
        holdExpiresAt: claim.holdExpiresAt.toISOString(),
        finalAmountRupees: amount - discount,
      };
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      claimId: result.claimId,
      discount: result.discount,
      discountPercent: result.discountPercent,
      holdExpiresAt: result.holdExpiresAt,
      finalAmountRupees: result.finalAmountRupees,
    });
  } catch (e) {
    console.error("[coupons/claim]", e);
    return NextResponse.json(
      { error: "error", message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
