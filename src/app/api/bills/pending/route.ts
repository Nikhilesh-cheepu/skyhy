export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

export async function GET() {
  try {
    const prisma = getPrisma();
    const current = getCurrentCustomer();
    if (!current?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const bills = await prisma.bill.findMany({
      where: { userId: current.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bills });
  } catch (e) {
    console.error("[bills/pending]", e);
    return NextResponse.json(
      { error: "Could not load bills. Please try again." },
      { status: 500 }
    );
  }
}

