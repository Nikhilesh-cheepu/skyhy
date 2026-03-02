import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hashAdminPassword } from '@/lib/admin-hash';

const ADMIN_COOKIE = 'admin_token';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!path.startsWith('/admin') && !path.startsWith('/api/admin')) {
    return NextResponse.next();
  }
  // Allow login page and login API without auth
  if (path === '/admin/login' || path === '/api/admin/login') {
    return NextResponse.next();
  }

  const cookieToken = request.cookies.get(ADMIN_COOKIE)?.value;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  const expectedToken = await hashAdminPassword(expectedPassword);
  if (cookieToken !== expectedToken) {
    if (path.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
