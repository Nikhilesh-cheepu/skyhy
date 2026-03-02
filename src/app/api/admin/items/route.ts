import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: [
        { section: { sortOrder: 'asc' } },
        { categoryRef: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
      include: {
        section: { select: { id: true, slug: true, name: true } },
        categoryRef: { select: { id: true, slug: true, name: true } },
      },
    });
    return NextResponse.json(items);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch items';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const description = typeof body?.description === 'string' ? body.description.trim() : '';
    const price = typeof body?.price === 'number' ? body.price : Number(body?.price);
    const sectionId = typeof body?.sectionId === 'string' ? body.sectionId : '';
    const categoryId = typeof body?.categoryId === 'string' ? body.categoryId : '';
    const category = typeof body?.category === 'string' ? body.category : 'veg';
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : null;
    const isAvailable = body?.isAvailable !== false;

    if (!name || !sectionId || !categoryId) {
      return NextResponse.json(
        { error: 'name, sectionId, and categoryId required' },
        { status: 400 }
      );
    }
    if (!Number.isInteger(price) || price < 0) {
      return NextResponse.json({ error: 'price must be a non-negative integer' }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price,
        sectionId,
        categoryId,
        category: category,
        imageUrl: imageUrl || undefined,
        isActive: isAvailable,
        sortOrder: 0,
      },
      include: {
        section: { select: { slug: true, name: true } },
        categoryRef: { select: { slug: true, name: true } },
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
