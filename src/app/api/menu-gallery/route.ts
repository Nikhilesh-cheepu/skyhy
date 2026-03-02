export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    const images = await prisma.menuGalleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(images);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch menu gallery';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

