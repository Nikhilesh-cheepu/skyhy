export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json().catch(() => ({}));
    const typeRaw = typeof body?.type === "string" ? body.type.toLowerCase() : "";
    const type = typeRaw === "whatsapp" || typeRaw === "call" ? typeRaw : null;
    if (!type) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 },
      );
    }
    await prisma.contactClick.create({
      data: { type },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[analytics/contact-click]", e);
    return NextResponse.json(
      { error: "Failed to record click" },
      { status: 500 },
    );
  }
}

