export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const body = await _request.json();
    const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase().replace(/\s+/g, '-') : undefined;
    if (!name && !slug) {
      return NextResponse.json({ error: 'name or slug required' }, { status: 400 });
    }
    const section = await prisma.section.update({
      where: { id },
      data: { ...(name != null && { name }), ...(slug != null && { slug }) },
    });
    return NextResponse.json(section);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update section';
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
    await prisma.section.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete section';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
