export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createCustomerSessionValue,
  getSessionCookieOptions,
} from "@/lib/customer-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawPhone = typeof body?.phone === "string" ? body.phone : "";
    const digits = rawPhone.replace(/\D/g, "");
    const last10 = digits.slice(-10);

    if (last10.length !== 10) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    const user = await prisma.user.upsert({
      where: { phone: last10 },
      update: {},
      create: { phone: last10 },
    });

    const value = createCustomerSessionValue(
      user.id,
      user.phone,
      SESSION_MAX_AGE_SECONDS
    );

    const res = NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, value, getSessionCookieOptions());

    return res;
  } catch (e) {
    console.error("[auth/sync-user]", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

