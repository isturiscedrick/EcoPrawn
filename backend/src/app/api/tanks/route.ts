import { accountAccess } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const tanks = await prisma.tank.findMany({
      where: { userId: account.id },
      include: {
        telemetries: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
        visionScans: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, tanks });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch tanks from database",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const account = await accountAccess({ write: true, admin: false });
  if (account instanceof Response) return account;
  try {
    const body = await request.json();
    const {
      name,
      pl = "PL-42",
      biomass = 31.2,
      targetToday = 1.5,
      fcr = 0,
      dispensedToday = 0,
      dissolvedOxygen = 6.2,
      ph = 7.9,
      temperature = 28.4,
      salinity = 15.0,
      waterLevel = 98.0,
      bodyLength = 11.6,
      weight = 18.6,
      population = 1720,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Tank name is required" },
        { status: 400 }
      );
    }

    const newTank = await prisma.tank.create({
      data: {
        userId: account.id,
        name,
        pl,
        biomass: Number(biomass),
        targetToday: Number(targetToday),
        fcr: Number(fcr),
        dispensedToday: Number(dispensedToday),
        telemetries: {
          create: {
            dissolvedOxygen: Number(dissolvedOxygen),
            ph: Number(ph),
            temperature: Number(temperature),
            salinity: Number(salinity),
            waterLevel: Number(waterLevel),
          },
        },
        visionScans: {
          create: {
            bodyLength: Number(bodyLength),
            weight: Number(weight),
            population: Number(population),
          },
        },
      },
      include: {
        telemetries: true,
        visionScans: true,
      },
    });

    return NextResponse.json({ success: true, tank: newTank }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create tank in database",
      },
      { status: 500 }
    );
  }
}
