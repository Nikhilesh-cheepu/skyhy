export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === 'string' ? body.password : '';
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected || password !== expected) {
      return NextResponse.json({ ok: false, error: 'Invalid password' }, { status: 401 });
    }
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
