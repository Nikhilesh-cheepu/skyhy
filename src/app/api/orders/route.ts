export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type OrderItemInput = {
  menuItemId: number;
  quantity: number;
  price: number;
};

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const items: OrderItemInput[] = Array.isArray(body?.items) ? body.items : [];
    const customerName =
      typeof body?.customerName === "string" ? body.customerName.trim() : null;
    const customerPhone =
      typeof body?.customerPhone === "string" ? body.customerPhone.trim() : null;

    if (!items.length) {
      return NextResponse.json(
        { error: "items are required" },
        { status: 400 }
      );
    }

    let totalAmount = 0;
    const sanitizedItems: OrderItemInput[] = [];
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
        return NextResponse.json(
          { error: "Invalid order item payload" },
          { status: 400 }
        );
      }
      totalAmount += price * quantity;
      sanitizedItems.push({ menuItemId, quantity, price });
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        totalAmount,
        status: "PAID",
        items: {
          create: sanitizedItems.map((it) => ({
            menuItemId: it.menuItemId,
            quantity: it.quantity,
            price: it.price,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error("[orders]", e);
    return NextResponse.json(
      { error: "Could not create order. Please try again." },
      { status: 500 }
    );
  }
}

