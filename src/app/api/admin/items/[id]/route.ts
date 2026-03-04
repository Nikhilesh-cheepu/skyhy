export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
      include: {
        section: { select: { id: true, slug: true, name: true } },
        categoryRef: { select: { id: true, slug: true, name: true } },
      },
    });
    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }
    const body = await request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const description = typeof body?.description === 'string' ? body.description.trim() : undefined;
    const price = typeof body?.price === 'number' ? body.price : body?.price != null ? Number(body.price) : undefined;
    const sectionId = typeof body?.sectionId === 'string' ? body.sectionId : undefined;
    const categoryId = typeof body?.categoryId === 'string' ? body.categoryId : undefined;
    const category = typeof body?.category === 'string' ? body.category : undefined;
    const imageUrl = body?.imageUrl !== undefined ? (body.imageUrl === null || body.imageUrl === '' ? null : String(body.imageUrl)) : undefined;
    const isAvailable = body?.isAvailable !== undefined ? Boolean(body.isAvailable) : undefined;

    if (
      name === undefined &&
      description === undefined &&
      price === undefined &&
      sectionId === undefined &&
      categoryId === undefined &&
      category === undefined &&
      imageUrl === undefined &&
      isAvailable === undefined
    ) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }
    if (price !== undefined && (!Number.isInteger(price) || price < 0)) {
      return NextResponse.json({ error: 'price must be a non-negative integer' }, { status: 400 });
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        ...(name != null && { name }),
        ...(description != null && { description }),
        ...(price != null && { price }),
        ...(sectionId != null && { sectionId }),
        ...(categoryId != null && { categoryId }),
        ...(category != null && { category }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isAvailable !== undefined && { isActive: isAvailable }),
      },
      include: {
        section: { select: { slug: true, name: true } },
        categoryRef: { select: { slug: true, name: true } },
      },
    });
    return NextResponse.json(item);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const itemId = parseInt(id, 10);
    if (Number.isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item id' }, { status: 400 });
    }
    await prisma.menuItem.delete({ where: { id: itemId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete item';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
