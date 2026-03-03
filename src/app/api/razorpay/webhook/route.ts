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
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
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
      await prisma.bill.update({
        where: { id: bill.id },
        data: { status: "PAID" },
      });
      if (bill.couponId) {
        await prisma.coupon.update({
          where: { id: bill.couponId },
          data: { status: "USED" },
        });
      }
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
