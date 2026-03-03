export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer-session";

type CartItem = { menuItemId: number; quantity: number; price: number };

export async function POST(request: Request) {
  try {
    const current = getCurrentCustomer();
    if (!current?.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const items: CartItem[] = Array.isArray(body?.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    const sanitized: { menuItemId: number; quantity: number; price: number }[] = [];
    for (const it of items) {
      const menuItemId = Number(it.menuItemId);
      const quantity = Number(it.quantity);
      const price = Number(it.price);
      if (
        !Number.isInteger(menuItemId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isInteger(price) ||
        price < 0
      ) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }
      sanitized.push({ menuItemId, quantity, price });
    }

    const TAXES_RATE = 0.17;
    const subtotal = sanitized.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxesAndCharges = Math.round(subtotal * TAXES_RATE);
    const totalAmount = subtotal + taxesAndCharges;

    const prisma = getPrisma();
    const order = await prisma.order.create({
      data: {
        userId: current.userId,
        customerName: typeof body?.customerName === "string" ? body.customerName.trim() || null : null,
        customerPhone: typeof body?.customerPhone === "string" ? body.customerPhone.trim() || null : null,
        totalAmount,
        status: "PENDING",
        items: {
          create: sanitized.map((it) => ({
            menuItemId: it.menuItemId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      orderId: order.id,
      totalAmount: order.totalAmount,
      hasNon128Items: order.items.some((i) => i.price !== 128),
    });
  } catch (e) {
    console.error("[orders/create-draft]", e);
    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 }
    );
  }
}
