import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { dispatchSms } from "@/lib/sms";
import { waterWarnings } from "@/lib/unisms";
import { isRecord, validTankId, validWaterReading } from "@/lib/api-validation";

export async function GET(request: Request) {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const { searchParams } = new URL(request.url);
    const tankId = searchParams.get("tankId");
    if (tankId !== null && !validTankId(tankId)) {
      return Response.json({ success: false, error: "Invalid tank ID" }, { status: 400 });
    }

    if (tankId) {
      const readings = await prisma.sensorTelemetry.findMany({
        where: { tankId, tank: { userId: account.id } },
        orderBy: { recordedAt: "desc" },
        take: 50,
      });
      return Response.json({ success: true, readings });
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

    return Response.json({ success: true, readings: latestReadings });
  } catch (error: unknown) {
    const err = error as Error;
    return Response.json(
      { success: false, error: err.message || "Failed to fetch sensor data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) return Response.json({ success: false, error: "Invalid reading" }, { status: 400 });
    const { tankId, dissolvedOxygen, ph, temperature, salinity, waterLevel } = body;

    if (!validTankId(tankId)) {
      return Response.json(
        { success: false, error: "tankId is required" },
        { status: 400 }
      );
    }
    if (Object.keys(body).some((key) => !["tankId", "dissolvedOxygen", "ph", "temperature", "salinity", "waterLevel"].includes(key)) ||
        !validWaterReading(body)) {
      return Response.json({ success: false, error: "Invalid water reading" }, { status: 400 });
    }

    const tank = await prisma.tank.findUnique({ where: { id: tankId, userId: account.id }, select: { id: true, name: true } });
    if (!tank) return Response.json({ success: false, error: "Tank not found" }, { status: 404 });

    const data = { tankId, dissolvedOxygen: dissolvedOxygen as number, ph: ph as number, temperature: temperature as number, salinity: salinity as number, waterLevel: waterLevel as number };
    const warnings = waterWarnings(data);
    const reading = await prisma.$transaction(async (tx) => {
      const result = await tx.sensorTelemetry.create({ data });
      if (warnings.length) {
        await tx.alert.createMany({ data: warnings.map((detail) => ({ userId: account.id, tankId, icon: "warn", title: "Water Quality Alert", detail })) });
      }
      await tx.tankActivity.create({
        data: {
          userId: account.id,
          tankId,
          tankName: tank.name,
          type: "sensor_reading",
          summary: warnings.length
            ? `Water reading recorded with ${warnings.length} warning(s)`
            : "Water-quality reading recorded",
        },
      });
      return result;
    });
    let sms: { status: string } = { status: "no_warning" };
    if (warnings.length) {
      try {
        sms = await dispatchSms(account.id, `EcoPrawn: ${tank.name.slice(0,80)}. ${warnings.join("; ")}. Check your tank now.`.slice(0,670), tankId);
      } catch {
        // Telemetry was saved successfully even if SMS persistence is unavailable.
        sms = { status: "unavailable" };
      }
    }
    return Response.json({ success: true, reading, sms }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return Response.json(
      { success: false, error: err.message || "Failed to record sensor reading" },
      { status: 500 }
    );
  }
}
