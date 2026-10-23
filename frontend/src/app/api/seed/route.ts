import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const existingTanksCount = await prisma.tank.count();

    if (existingTanksCount > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already contains data.",
        tanksCount: existingTanksCount,
      });
    }

    // Create Tank 1
    const tank1 = await prisma.tank.create({
      data: {
        name: "Tank 1",
        pl: "PL-42",
        biomass: 31.2,
        targetToday: 1.5,
        fcr: 1.35,
        telemetries: {
          create: [
            {
              dissolvedOxygen: 6.2,
              ph: 7.9,
              temperature: 28.4,
              salinity: 15.0,
              waterLevel: 98.0,
            },
          ],
        },
        visionScans: {
          create: [
            {
              bodyLength: 11.6,
              weight: 18.6,
              population: 1720,
              abnormalCount: 0,
              notes: "Growth scan completed — no anomalies detected.",
            },
          ],
        },
        feedSchedules: {
          create: [
            { timeSlot: "06:00", amountKg: 1.8, status: "done" },
            { timeSlot: "10:00", amountKg: 1.9, status: "done" },
            { timeSlot: "14:00", amountKg: 1.9, status: "done" },
            { timeSlot: "18:00", amountKg: 1.8, status: "upcoming" },
          ],
        },
        alerts: {
          create: [
            {
              icon: "info",
              title: "Aerator auto-activated",
              detail: "Tank 1 — DO dropped to 4.8 mg/L, relay triggered automatically",
            },
            {
              icon: "info",
              title: "Feed cycle completed",
              detail: "Tank 1 — scheduled 14:00 dispense, biomass-adjusted",
            },
          ],
        },
      },
    });

    // Biofloc metrics
    await prisma.bioflocMetric.create({
      data: {
        flocVolume: 12.4,
        cnRatio: 14.8,
        tss: 310.0,
        alkalinity: 148.0,
      },
    });

    // Effluent logs
    await prisma.effluentLog.createMany({
      data: [
        {
          tankId: tank1.id,
          event: "Scheduled discharge cycle",
          detail: "Tank 1 blowdown routed to wetland outlet — 220 L.",
          destination: "wetland",
          volumeL: 220,
        },
        {
          tankId: tank1.id,
          event: "Scheduled discharge cycle",
          detail: "Tank 1 blowdown routed to mangrove outlet — 640 L.",
          destination: "mangrove",
          volumeL: 640,
        },
        {
          tankId: tank1.id,
          event: "Carbon dosing",
          detail: "Molasses dosed to Tank 1 to correct C:N ratio.",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with EcoPrawn default data!",
      tank: tank1,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || "Failed to seed database" },
      { status: 500 }
    );
  }
}
