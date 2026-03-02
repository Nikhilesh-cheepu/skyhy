export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(offers);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch offers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

