export const dynamic = "force-dynamic";
export const revalidate = 0;

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

type CreateLinkBody = {
  amount: number;
  currency?: string;
  eventId?: string;
  customerName?: string;
  customerPhone?: string;
  people?: number;
};

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay keys are not configured on the server" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as CreateLinkBody;
    const amount =
      typeof body?.amount === "number"
        ? body.amount
        : body?.amount != null
        ? Number(body.amount)
        : NaN;

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number (in paise)" },
        { status: 400 }
      );
    }

    const currency =
      typeof body?.currency === "string" && body.currency
        ? body.currency
        : "INR";

    const customerName =
      typeof body?.customerName === "string"
        ? body.customerName.trim() || undefined
        : undefined;
    const customerPhone =
      typeof body?.customerPhone === "string"
        ? body.customerPhone.trim() || undefined
        : undefined;
    const people =
      typeof body?.people === "number"
        ? body.people
        : body?.people != null
        ? Number(body.people)
        : undefined;

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount),
      currency,
      description: "SkyHy Event Ticket Booking",
      customer: {
        name: customerName,
        contact: customerPhone,
      },
      reference_id: body.eventId,
      notes: {
        eventId: body.eventId ?? "",
        customerName: customerName ?? "",
        customerPhone: customerPhone ?? "",
        people: people != null ? String(people) : "",
      },
      notify: {
        sms: true,
        email: false,
      },
      callback_method: "get",
    });

    return NextResponse.json({
      id: paymentLink.id,
      short_url: paymentLink.short_url,
      status: paymentLink.status,
    });
  } catch (e) {
    console.error("[razorpay/create-link]", e);
    return NextResponse.json(
      { error: "Could not create payment link. Please try again." },
      { status: 500 }
    );
  }
}

