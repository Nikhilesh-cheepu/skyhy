import { cookies } from 'next/headers';
import { hashAdminPassword } from './admin-hash';

const ADMIN_COOKIE = 'admin_token';

export async function getAdminToken(): Promise<string | null> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return hashAdminPassword(pw);
}

export async function setAdminCookie(): Promise<void> {
  const token = await getAdminToken();
  if (!token) return;
  const c = await cookies();
  c.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  });
}

export async function clearAdminCookie(): Promise<void> {
  const c = await cookies();
  c.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

export async function verifyAdmin(): Promise<boolean> {
  const c = await cookies();
  const cookieToken = c.get(ADMIN_COOKIE)?.value;
  const expected = await getAdminToken();
  if (!expected || !cookieToken) return false;
  return cookieToken === expected;
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE;
}
