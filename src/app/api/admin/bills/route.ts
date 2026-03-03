export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get("phone");

    if (!rawPhone) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    const phone = rawPhone.trim();
    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "phone must be a 10-digit number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        bills: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null, bills: [] });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      bills: user.bills,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to search bills by phone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();

    const rawPhone =
      typeof body?.phone === "string" ? body.phone.trim() : undefined;
    const amountRaw =
      typeof body?.amount === "number"
        ? body.amount
        : body?.amount != null
        ? Number(body.amount)
        : NaN;
    const notes =
      typeof body?.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : undefined;

    if (!rawPhone || !/^\d{10}$/.test(rawPhone)) {
      return NextResponse.json(
        { error: "phone must be a 10-digit number" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(amountRaw) || amountRaw <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: rawPhone },
    });
    if (!user) {
      return NextResponse.json(
        {
          error:
            "User not found for this phone. Ask customer to login once on the website with this phone number, then try again.",
        },
        { status: 400 }
      );
    }

    const bill = await prisma.bill.create({
      data: {
        userId: user.id,
        amount: Math.round(amountRaw),
        notes,
      },
    });

    return NextResponse.json(bill);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to create bill for user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

