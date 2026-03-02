export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import { getPrisma } from "@/lib/prisma";

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

    const booking = await prisma.eventBooking.findFirst({
      where: { razorpayOrderId: orderId },
    });
    if (booking) {
      await prisma.eventBooking.update({
        where: { id: booking.id },
        data: { paymentStatus: "PAID" },
      });
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
      return NextResponse.json({ received: true, updated: "order" });
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
