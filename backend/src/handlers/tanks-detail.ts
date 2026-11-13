import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isRecord, validLabel, validNumber, validTankId } from "@/lib/api-validation";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = params;
    if (!validTankId(id)) return Response.json({ success: false, error: "Invalid tank ID" }, { status: 400 });
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
      return Response.json(
        { success: false, error: "Tank not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, tank });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return Response.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return Response.json(
      { success: false, error: err.message || "Failed to fetch tank" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = params;
    if (!validTankId(id)) return Response.json({ success: false, error: "Invalid tank ID" }, { status: 400 });
    await prisma.tank.delete({
      where: { id, userId: account.id },
    });

    return Response.json({ success: true, message: "Tank deleted" });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return Response.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return Response.json(
      { success: false, error: err.message || "Failed to delete tank" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const { id } = params;
    if (!validTankId(id)) return Response.json({ success: false, error: "Invalid tank ID" }, { status: 400 });
    const body: unknown = await request.json().catch(() => null);
    const allowed = ["name", "pl", "biomass", "targetToday", "fcr", "dispensedToday"];
    if (!isRecord(body) || Object.keys(body).length === 0 ||
        Object.keys(body).some(key => !allowed.includes(key))) {
      return Response.json({ success: false, error: "Unsupported tank fields" }, { status: 400 });
    }
    for (const [key, value] of Object.entries(body)) {
      const valid = ["name", "pl"].includes(key)
        ? validLabel(value)
        : validNumber(value, 0);
      if (!valid) return Response.json({ success: false, error: "Invalid tank field" }, { status: 400 });
    }

    const updatedTank = await prisma.$transaction(async (tx) => {
      const current = await tx.tank.findFirst({
        where: { id, userId: account.id },
        select: { id: true, name: true },
      });
      if (!current) return null;
      const updated = await tx.tank.update({
        where: { id, userId: account.id },
        data: body,
      });
      const changed = Object.keys(body).map((key) => key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)).join(", ");
      await tx.tankActivity.create({
        data: {
          userId: account.id,
          tankId: id,
          tankName: typeof body.name === "string" ? body.name : current.name,
          type: "updated",
          summary: `Updated ${changed || "tank details"}`,
        },
      });
      return updated;
    });
    if (!updatedTank) return Response.json({ success: false, error: "Tank not found" }, { status: 404 });

    return Response.json({ success: true, tank: updatedTank });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return Response.json({ success: false, error: "Tank not found" }, { status: 404 });
    }
    const err = error as Error;
    return Response.json(
      { success: false, error: err.message || "Failed to update tank" },
      { status: 500 }
    );
  }
}
