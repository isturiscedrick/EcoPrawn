import { accountAccess } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = await params;
    const tank = await prisma.tank.findUnique({
      where: { id, userId: account.id },
      include: {
        telemetries: { orderBy: { recordedAt: "desc" }, take: 10 },
        visionScans: { orderBy: { recordedAt: "desc" }, take: 5 },
        feedSchedules: { orderBy: { timeSlot: "asc" } },
        alerts: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!tank) {
      return NextResponse.json(
        { success: false, error: "Tank not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, tank });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch tank" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = await params;
    await prisma.tank.delete({
      where: { id, userId: account.id },
    });

    return NextResponse.json({ success: true, message: "Tank deleted" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete tank" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = await params;
    const body = await request.json();
    const allowed = ["name", "pl", "biomass", "targetToday", "fcr", "dispensedToday"];
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some(key => !allowed.includes(key))) {
      return NextResponse.json({ success: false, error: "Unsupported tank fields" }, { status: 400 });
    }
    for (const [key, value] of Object.entries(body)) {
      const valid = ["name", "pl"].includes(key)
        ? typeof value === "string" && value.trim().length > 0
        : typeof value === "number" && Number.isFinite(value) && value >= 0;
      if (!valid) return NextResponse.json({ success: false, error: "Invalid tank field" }, { status: 400 });
    }

    const updatedTank = await prisma.tank.update({
      where: { id, userId: account.id },
      data: body,
    });

    return NextResponse.json({ success: true, tank: updatedTank });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update tank" },
      { status: 500 }
    );
  }
}
