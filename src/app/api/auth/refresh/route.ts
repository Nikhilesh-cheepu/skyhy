export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
  getSessionPayload,
  createCustomerSessionValue,
  getSessionCookieOptions,
} from "@/lib/customer-session";

/**
 * Sliding session: if the user has a valid session with less than 7 days
 * left, extend it back to 30 days. Call on app load and periodically (e.g. every 12h).
 */
export async function GET() {
  const payload = getSessionPayload();
  if (!payload) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const secondsLeft = payload.exp - now;

  if (secondsLeft > SESSION_REFRESH_THRESHOLD_SECONDS) {
    return NextResponse.json({ refreshed: false });
  }

  const value = createCustomerSessionValue(
    payload.userId,
    payload.phone,
    SESSION_MAX_AGE_SECONDS
  );

  const res = NextResponse.json({ refreshed: true });
  res.cookies.set(SESSION_COOKIE_NAME, value, getSessionCookieOptions());
  return res;
}
