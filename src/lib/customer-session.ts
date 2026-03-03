import { cookies } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "skyhy_session";

type SessionPayload = {
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
  maxAgeSeconds = 60 * 60 * 24 * 14 // 14 days
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

export function getCurrentCustomer(): CurrentUser {
  // next/headers cookies() typing differs between environments; cast to any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookieStore = cookies() as any;
  const cookie: string | undefined =
    cookieStore?.get?.(SESSION_COOKIE_NAME)?.value;
  if (!cookie) return null;
  const [data, sig] = cookie.split(".");
  if (!data || !sig) return null;
  if (sign(data) !== sig) return null;

  try {
    const json = Buffer.from(data, "base64url").toString("utf8");
    const payload = JSON.parse(json) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: payload.userId, phone: payload.phone };
  } catch {
    return null;
  }
}

