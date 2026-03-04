export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import {
  getSessionPayload,
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
  SESSION_COOKIE_NAME,
  createCustomerSessionValue,
  getSessionCookieOptions,
} from "@/lib/customer-session";

export async function GET() {
  const payload = getSessionPayload();
  if (!payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = { userId: payload.userId, phone: payload.phone };
  const res = NextResponse.json({ user });

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = payload.exp - now;
  if (secondsLeft <= SESSION_REFRESH_THRESHOLD_SECONDS) {
    const value = createCustomerSessionValue(
      payload.userId,
      payload.phone,
      SESSION_MAX_AGE_SECONDS
    );
    res.cookies.set(SESSION_COOKIE_NAME, value, getSessionCookieOptions());
  }

  return res;
}

