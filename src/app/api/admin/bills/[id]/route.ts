export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const body = await request.json();

    const amount =
      body?.amount != null ? Number(body.amount) : undefined;
    const billType =
      typeof body?.billType === "string" ? body.billType : undefined;
    const notes =
      typeof body?.notes === "string" ? (body.notes.trim() || null) : undefined;
    const status = body?.status as "PENDING" | "PARTIAL" | "PAID" | undefined;
    const paidAmount =
      body?.paidAmount != null ? Math.round(Number(body.paidAmount)) : undefined;

    if (
      amount === undefined &&
      billType === undefined &&
      notes === undefined &&
      status === undefined &&
      paidAmount === undefined
    ) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const updateData: {
      amount?: number;
      billType?: string;
      notes?: string | null;
      status?: "PENDING" | "PARTIAL" | "PAID";
      paidAmount?: number;
      paidAt?: Date | null;
    } = {};

    if (amount !== undefined) {
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          { error: "amount must be a positive number" },
          { status: 400 }
        );
      }
      updateData.amount = Math.round(amount);
    }

    if (billType !== undefined) {
      updateData.billType = billType === "128" ? "128" : "a_la_carte";
    }
    if (notes !== undefined) updateData.notes = notes;

    if (status !== undefined) {
      if (!["PENDING", "PARTIAL", "PAID"].includes(status)) {
        return NextResponse.json(
          { error: "status must be PENDING, PARTIAL, or PAID" },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status === "PAID") {
        updateData.paidAt = new Date();
        updateData.paidAmount = updateData.amount ?? existing.amount;
      } else if (status === "PARTIAL") {
        updateData.paidAt = new Date();
        if (paidAmount !== undefined) {
          const amt = existing.amount;
          if (paidAmount < 0 || paidAmount > amt) {
            return NextResponse.json(
              { error: "paidAmount must be between 0 and bill amount" },
              { status: 400 }
            );
          }
          updateData.paidAmount = paidAmount;
        }
      } else {
        updateData.paidAt = null;
        updateData.paidAmount = 0;
      }
    } else if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount;
      updateData.paidAt = new Date();
      if (paidAmount >= (updateData.amount ?? existing.amount)) {
        updateData.status = "PAID";
        updateData.paidAmount = updateData.amount ?? existing.amount;
      } else {
        updateData.status = "PARTIAL";
      }
    }

    const bill = await prisma.bill.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(bill);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to update bill";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;

    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    await prisma.bill.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to delete bill";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
