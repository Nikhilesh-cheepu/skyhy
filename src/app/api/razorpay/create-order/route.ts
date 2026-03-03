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
type BillPayload = { billId: string };

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
    } else if (type === "bill") {
      const billPayload = body?.bill as BillPayload | undefined;
      const billId =
        billPayload && typeof billPayload.billId === "string"
          ? billPayload.billId
          : "";
      if (!billId) {
        return NextResponse.json(
          { error: "billId is required for bill payments" },
          { status: 400 }
        );
      }

      const bill = await prisma.bill.findUnique({
        where: { id: billId },
        include: { user: true, coupon: true },
      });
      if (!bill) {
        return NextResponse.json(
          { error: "Bill not found" },
          { status: 404 }
        );
      }

      const userId = bill.userId;

      // Find best ACTIVE coupon for this user, if any
      const coupon =
        userId &&
        (await prisma.coupon.findFirst({
          where: {
            userId,
            status: "ACTIVE",
          },
          orderBy: { createdAt: "asc" },
        }));

      const baseAmount = bill.amount;
      let discount = 0;
      if (coupon) {
        if (coupon.discountAmount != null) {
          discount = coupon.discountAmount;
        } else if (coupon.discountPercent != null) {
          discount = Math.round(
            (baseAmount * coupon.discountPercent) / 100
          );
        }
        if (discount < 0) discount = 0;
        if (discount > baseAmount) discount = baseAmount;
      }

      const finalAmountRupees = baseAmount - discount;
      const finalAmountPaise = finalAmountRupees * 100;

      // If client passed a different amount, ignore it; always use computed finalAmountPaise
      if (!Number.isFinite(finalAmountPaise) || finalAmountPaise <= 0) {
        return NextResponse.json(
          { error: "Computed bill amount is invalid" },
          { status: 400 }
        );
      }

      // Update Razorpay order with final amount (already created with 'amount', but we want to reflect final in DB and response)
      await prisma.bill.update({
        where: { id: billId },
        data: {
          razorpayOrderId: order.id,
          status: "PENDING",
          couponId: coupon ? coupon.id : bill.couponId,
        },
      });

      // Return order info plus final amount and discount so client can display breakdown
      return NextResponse.json({
        ...order,
        amount: finalAmountPaise,
        finalAmountRupees,
        discount,
      });
    }
    // If no type or unknown type, we only create Razorpay order (no DB record for webhook to update)

    return NextResponse.json(order);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
