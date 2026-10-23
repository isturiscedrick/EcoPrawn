import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tankId = searchParams.get("tankId");

    if (tankId) {
      const readings = await prisma.sensorTelemetry.findMany({
        where: { tankId },
        orderBy: { recordedAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ success: true, readings });
    }

    // Get latest telemetry for each tank
    const latestReadings = await prisma.sensorTelemetry.findMany({
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
  try {
    const body = await request.json();
    const { tankId, dissolvedOxygen, ph, temperature, salinity, waterLevel } = body;

    if (!tankId) {
      return NextResponse.json(
        { success: false, error: "tankId is required" },
        { status: 400 }
      );
    }

    const reading = await prisma.sensorTelemetry.create({
      data: {
        tankId,
        dissolvedOxygen: Number(dissolvedOxygen),
        ph: Number(ph),
        temperature: Number(temperature),
        salinity: Number(salinity),
        waterLevel: Number(waterLevel),
      },
    });

    // Check thresholds and create alert if out of range
    const alertsToCreate = [];
    if (reading.dissolvedOxygen < 4.5) {
      alertsToCreate.push({
        tankId,
        icon: "warn",
        title: "Low Dissolved Oxygen Alert",
        detail: `DO level is critical at ${reading.dissolvedOxygen} mg/L (target ≥ 4.5 mg/L). Aerators activated.`,
      });
    }
    if (reading.ph < 7.5 || reading.ph > 8.5) {
      alertsToCreate.push({
        tankId,
        icon: "warn",
        title: "Abnormal pH Alert",
        detail: `pH level is out of bounds at ${reading.ph} (target 7.5 – 8.5).`,
      });
    }

    for (const alertData of alertsToCreate) {
      await prisma.alert.create({ data: alertData });
    }

    return NextResponse.json({ success: true, reading }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to record sensor reading" },
      { status: 500 }
    );
  }
}
