import { accountAccess } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isRecord, validLabel, validNumber, validWaterReading } from "@/lib/api-validation";

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
    const body: unknown = await request.json().catch(() => null);
    if (!isRecord(body)) {
      return NextResponse.json({ success: false, error: "Invalid JSON object" }, { status: 400 });
    }
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
      abnormal = 0,
    } = body;

    const allowed = ["name", "pl", "biomass", "targetToday", "fcr", "dispensedToday", "dissolvedOxygen", "ph", "temperature", "salinity", "waterLevel", "bodyLength", "weight", "population", "abnormal"];
    if (Object.keys(body).some((key) => !allowed.includes(key))) {
      return NextResponse.json({ success: false, error: "Unsupported tank fields" }, { status: 400 });
    }
    if (!validLabel(name)) {
      return NextResponse.json(
        { success: false, error: "Tank name must be trimmed and 1 to 100 characters" },
        { status: 400 }
      );
    }
    if (!validLabel(pl) ||
      ![biomass, targetToday, fcr, dispensedToday, bodyLength, weight].every((value) => validNumber(value, 0)) ||
      !Number.isInteger(population) || !validNumber(population, 0, 2147483647) ||
      !Number.isInteger(abnormal) || !validNumber(abnormal, 0, 2147483647) || (abnormal as number) > (population as number) ||
      !validWaterReading({ dissolvedOxygen, ph, temperature, salinity, waterLevel })) {
      return NextResponse.json({ success: false, error: "Invalid tank field" }, { status: 400 });
    }

    const newTank = await prisma.tank.create({
      data: {
        userId: account.id,
        name,
        pl,
        biomass: biomass as number,
        targetToday: targetToday as number,
        fcr: fcr as number,
        dispensedToday: dispensedToday as number,
        telemetries: {
          create: {
            dissolvedOxygen: dissolvedOxygen as number,
            ph: ph as number,
            temperature: temperature as number,
            salinity: salinity as number,
            waterLevel: waterLevel as number,
          },
        },
        visionScans: {
          create: {
            bodyLength: bodyLength as number,
            weight: weight as number,
            population: population as number,
            abnormalCount: abnormal as number,
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
