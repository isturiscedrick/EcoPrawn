import { requireAccess } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAccess({ write: false, admin: false });
  if (denied) return denied;
  try {
    const { id } = await params;
    const tank = await prisma.tank.findUnique({
      where: { id },
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
  const denied = await requireAccess({ write: true, admin: false });
  if (denied) return denied;
  try {
    const { id } = await params;
    await prisma.tank.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Tank deleted" });
  } catch (error: unknown) {
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
  const denied = await requireAccess({ write: true, admin: false });
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedTank = await prisma.tank.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, tank: updatedTank });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update tank" },
      { status: 500 }
    );
  }
}
