export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
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
    const idToken =
      typeof body?.idToken === "string" ? body.idToken.trim() : "";
    if (!idToken) {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const phoneNumber = decoded.phone_number;
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is missing from Firebase token" },
        { status: 400 }
      );
    }

    // Expect Indian numbers like +91XXXXXXXXXX; store last 10 digits
    const digits = phoneNumber.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length !== 10) {
      return NextResponse.json(
        { error: "Only Indian (+91) 10-digit phone numbers are supported" },
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
    console.error("[auth/login]", e);
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}

