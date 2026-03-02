export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    const offers = await prisma.offer.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(offers);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch offers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const ctaType = typeof body?.ctaType === 'string' ? body.ctaType : 'VIEW_MENU';
    const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : 'image';
    const mediaUrl = typeof body?.mediaUrl === 'string' ? body.mediaUrl : '';

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: 'title and mediaUrl are required' }, { status: 400 });
    }

    const count = await prisma.offer.count();
    const offer = await prisma.offer.create({
      data: {
        title,
        ctaType,
        mediaType,
        mediaUrl,
        sortOrder: count,
      },
    });
    return NextResponse.json(offer);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create offer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

