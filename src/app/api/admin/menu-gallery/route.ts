import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const images = await prisma.menuGalleryImage.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(images);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch menu gallery';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const url = typeof body?.url === 'string' ? body.url : '';
    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 });
    }
    const count = await prisma.menuGalleryImage.count();
    const image = await prisma.menuGalleryImage.create({
      data: { url, title: title || null, sortOrder: count },
    });
    return NextResponse.json(image);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create menu gallery image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

