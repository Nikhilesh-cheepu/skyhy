export const dynamic = "force-dynamic";
export const revalidate = 0;

import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type EventBookingPayload = {
  fullName: string;
  mobile: string;
  date: string;
  time: string;
  people: number;
  ticketPrice: number;
  eventId?: string;
};

type CartItemPayload = { menuItemId: number; quantity: number; price: number };

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body?.type as string | undefined;
    const amount =
      typeof body?.amount === "number"
        ? body.amount
        : body?.amount != null
          ? Number(body.amount)
          : NaN;
    const currency =
      typeof body?.currency === "string" && body.currency
        ? body.currency
        : "INR";

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number (in paise)" },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server" },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
    });

    const prisma = getPrisma();

    if (type === "event") {
      const b = body?.booking as EventBookingPayload | undefined;
      if (
        !b ||
        typeof b.fullName !== "string" ||
        !b.fullName.trim() ||
        typeof b.mobile !== "string" ||
        !b.mobile.trim() ||
        typeof b.date !== "string" ||
        !b.date ||
        typeof b.time !== "string" ||
        !b.time ||
        typeof b.people !== "number" ||
        b.people <= 0
      ) {
        return NextResponse.json(
          { error: "event booking requires booking payload (fullName, mobile, date, time, people)" },
          { status: 400 }
        );
      }
      const date = new Date(b.date);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ error: "Invalid booking date" }, { status: 400 });
      }
      await prisma.eventBooking.create({
        data: {
          fullName: b.fullName.trim(),
          mobile: b.mobile.trim(),
          date,
          time: b.time.trim(),
          people: b.people,
          ticketPrice: typeof b.ticketPrice === "number" ? b.ticketPrice : 0,
          eventId: typeof b.eventId === "string" ? b.eventId : undefined,
          paymentStatus: "PENDING",
          razorpayOrderId: order.id,
        },
      });
    } else if (type === "cart") {
      const items: CartItemPayload[] = Array.isArray(body?.items) ? body.items : [];
      if (!items.length) {
        return NextResponse.json(
          { error: "cart order requires items array" },
          { status: 400 }
        );
      }
      const sanitized: { menuItemId: number; quantity: number; price: number }[] = [];
      for (const it of items) {
        const menuItemId = Number(it.menuItemId);
        const quantity = Number(it.quantity);
        const price = Number(it.price);
        if (
          !Number.isInteger(menuItemId) ||
          !Number.isInteger(quantity) ||
          quantity <= 0 ||
          !Number.isInteger(price) ||
          price < 0
        ) {
          return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
        }
        sanitized.push({ menuItemId, quantity, price });
      }
      // totalAmount = actual amount charged (includes taxes, discount) in rupees
      const totalAmount = Math.round(amount / 100);
      const customerName =
        typeof body?.customerName === "string" ? body.customerName.trim() || null : null;
      const customerPhone =
        typeof body?.customerPhone === "string" ? body.customerPhone.trim() || null : null;

      await prisma.order.create({
        data: {
          customerName,
          customerPhone,
          totalAmount,
          status: "PENDING",
          razorpayOrderId: order.id,
          items: {
            create: sanitized.map((it) => ({
              menuItemId: it.menuItemId,
              quantity: it.quantity,
              price: it.price,
            })),
          },
        },
      });
    }
    // If no type or unknown type, we only create Razorpay order (no DB record for webhook to update)

    return NextResponse.json(order);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
