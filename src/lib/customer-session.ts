import { cookies } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "skyhy_session";

/** 30-day persistent session */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Refresh (extend) session when less than this many seconds remain */
export const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  phone: string;
  exp: number; // seconds since epoch
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return secret;
}

function sign(data: string): string {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function createCustomerSessionValue(
  userId: string,
  phone: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS
) {
  const payload: SessionPayload = {
    userId,
    phone,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(data);
  return `${data}.${signature}`;
}

export type CurrentUser = {
  userId: string;
  phone: string;
} | null;

function getCookieStore() {
  // next/headers cookies() typing differs between environments; cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cookies() as any;
}

/**
 * Returns the raw session payload if the cookie is valid and not expired.
 * Used by the refresh endpoint to decide whether to extend the session.
 */
export function getSessionPayload(): SessionPayload | null {
  const cookieStore = getCookieStore();
  const cookie: string | undefined =
    cookieStore?.get?.(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  const [data, sig] = cookie.split(".");
  if (!data || !sig) return null;
  if (sign(data) !== sig) return null;

  try {
    const json = Buffer.from(data, "base64url").toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getCurrentCustomer(): CurrentUser {
  const payload = getSessionPayload();
  if (!payload) return null;
  return { userId: payload.userId, phone: payload.phone };
}

/** Cookie options for setting the session (secure in prod, 30-day maxAge). */
export function getSessionCookieOptions(maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

