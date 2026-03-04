export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getPrisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "RAZORPAY_WEBHOOK_SECRET not configured" },
        { status: 500 }
      );
    }

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const rawBody = await request.text();
    const expectedSignature = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: {
        payment?: { entity?: { order_id?: string } };
      };
    };

    if (payload.event !== "payment.captured") {
      return NextResponse.json({ received: true });
    }

    const orderId =
      payload.payload?.payment?.entity?.order_id;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const prisma = getPrisma();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "";
    const detailsLink = baseUrl ? `${baseUrl}/account` : "your account";

    const booking = await prisma.eventBooking.findFirst({
      where: { razorpayOrderId: orderId },
    });
    if (booking) {
      await prisma.eventBooking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID" },
      });
      void sendSms(
        booking.mobile,
        `SKYHY: Booking confirmed. View details: ${detailsLink}`
      ).catch(() => {});
      return NextResponse.json({ received: true, updated: "event_booking" });
    }

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: orderId },
    });
    if (order) {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
        });
        const now = new Date();
        const heldClaim = await tx.couponClaim.findFirst({
          where: {
            orderId: order.id,
            status: "HELD",
            holdExpiresAt: { gt: now },
          },
        });
        if (heldClaim) {
          await tx.couponClaim.update({
            where: { id: heldClaim.id },
            data: { status: "USED" },
          });
          const dayRow = await tx.couponDay.upsert({
            where: { dayKey: heldClaim.dayKey },
            create: { dayKey: heldClaim.dayKey, issuedCount: 1 },
            update: { issuedCount: { increment: 1 } },
          });
          // #region agent log
          void fetch("http://127.0.0.1:7429/ingest/5ae8864a-ec9c-43ea-8c05-ee65502b976d", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "58d6f0",
            },
            body: JSON.stringify({
              sessionId: "58d6f0",
              runId: "discount_initial",
              hypothesisId: "H_WEBHOOK_ORDER",
              location: "src/app/api/razorpay/webhook/route.ts:84",
              message: "Webhook applied coupon for order",
              data: {
                orderId: order.id,
                dayKey: heldClaim.dayKey,
                newIssuedCount: dayRow.issuedCount,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion agent log
        }
      });
      const orderPhone = order.customerPhone?.trim();
      if (orderPhone) {
        void sendSms(
          orderPhone,
          `SKYHY: Order confirmed. View details: ${detailsLink}`
        ).catch(() => {});
      }
      return NextResponse.json({ received: true, updated: "order" });
    }

    const bill = await prisma.bill.findFirst({
      where: { razorpayOrderId: orderId },
      include: { user: true },
    });
    if (bill) {
      await prisma.$transaction(async (tx) => {
        await tx.bill.update({
          where: { id: bill.id },
          data: { status: "PAID" },
        });
        const now = new Date();
        const heldClaim = await tx.couponClaim.findFirst({
          where: {
            billId: bill.id,
            status: "HELD",
            holdExpiresAt: { gt: now },
          },
        });
        if (heldClaim) {
          await tx.couponClaim.update({
            where: { id: heldClaim.id },
            data: { status: "USED" },
          });
          const dayRow = await tx.couponDay.upsert({
            where: { dayKey: heldClaim.dayKey },
            create: { dayKey: heldClaim.dayKey, issuedCount: 1 },
            update: { issuedCount: { increment: 1 } },
          });
          // #region agent log
          void fetch("http://127.0.0.1:7429/ingest/5ae8864a-ec9c-43ea-8c05-ee65502b976d", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "58d6f0",
            },
            body: JSON.stringify({
              sessionId: "58d6f0",
              runId: "discount_initial",
              hypothesisId: "H_WEBHOOK_BILL",
              location: "src/app/api/razorpay/webhook/route.ts:123",
              message: "Webhook applied coupon for bill",
              data: {
                billId: bill.id,
                dayKey: heldClaim.dayKey,
                newIssuedCount: dayRow.issuedCount,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {});
          // #endregion agent log
        }
      });

      const billPhone = bill.user?.phone?.trim();
      if (billPhone) {
        void sendSms(
          billPhone,
          `SKYHY: Bill payment confirmed. View details: ${detailsLink}`
        ).catch(() => {});
      }
      return NextResponse.json({ received: true, updated: "bill" });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[razorpay/webhook]", e);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
