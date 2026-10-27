import { accountAccess } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dispatchSms } from "@/lib/sms";
import { waterWarnings } from "@/lib/unisms";

export async function GET(request: Request) {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const { searchParams } = new URL(request.url);
    const tankId = searchParams.get("tankId");

    if (tankId) {
      const readings = await prisma.sensorTelemetry.findMany({
        where: { tankId, tank: { userId: account.id } },
        orderBy: { recordedAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ success: true, readings });
    }

    // Get latest telemetry for each tank
    const latestReadings = await prisma.sensorTelemetry.findMany({
      where: { tank: { userId: account.id } },
      distinct: ["tankId"],
      orderBy: { recordedAt: "desc" },
      include: {
        tank: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, readings: latestReadings });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch sensor data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
    if (!body || typeof body !== "object") return NextResponse.json({ success: false, error: "Invalid reading" }, { status: 400 });
    const { tankId, dissolvedOxygen, ph, temperature, salinity, waterLevel } = body;

    if (typeof tankId !== "string" || !tankId) {
      return NextResponse.json(
        { success: false, error: "tankId is required" },
        { status: 400 }
      );
    }

    const tank = await prisma.tank.findUnique({ where: { id: tankId, userId: account.id }, select: { id: true, name: true } });
    if (!tank) return NextResponse.json({ success: false, error: "Tank not found" }, { status: 404 });
    if (![dissolvedOxygen, ph, temperature, salinity, waterLevel].every((value) => typeof value === "number" && Number.isFinite(value))) {
      return NextResponse.json({ success: false, error: "All five water readings must be finite numbers" }, { status: 400 });
    }

    const warnings = waterWarnings({ dissolvedOxygen, ph, temperature, salinity, waterLevel });
    const data = { tankId, dissolvedOxygen, ph, temperature, salinity, waterLevel };
    const reading = warnings.length
      ? await prisma.$transaction(async (tx) => {
          const result = await tx.sensorTelemetry.create({ data });
          await tx.alert.createMany({ data: warnings.map((detail) => ({ userId: account.id, tankId, icon: "warn", title: "Water Quality Alert", detail })) });
          return result;
        })
      : await prisma.sensorTelemetry.create({ data });
    let sms: { status: string } = { status: "no_warning" };
    if (warnings.length) {
      try {
        sms = await dispatchSms(account.id, `EcoPrawn: ${tank.name.slice(0,80)}. ${warnings.join("; ")}. Check your tank now.`.slice(0,670), tankId);
      } catch {
        // Telemetry was saved successfully even if SMS persistence is unavailable.
        sms = { status: "unavailable" };
      }
    }
    return NextResponse.json({ success: true, reading, sms }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record sensor reading" },
      { status: 500 }
    );
  }
}
