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
      return NextResponse.json(
        { error: "phone is required for now" },
        { status: 400 }
      );
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
    });

    if (!user) {
      return NextResponse.json({ bills: [] });
    }

    const bills = await prisma.bill.findMany({
      where: { userId: user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bills });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to fetch pending bills";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

