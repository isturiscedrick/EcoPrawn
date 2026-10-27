import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const account = await accountAccess({ write: false });
  if (account instanceof Response) return account;
  const tankId = new URL(request.url).searchParams.get("tankId");
  if (!tankId) return Response.json({ error: "Choose a tank" }, { status: 400 });
  try {
    const readings = await prisma.hardwareTelemetry.findMany({
      where: { tankId, tank: { userId: account.id } },
      orderBy: { recordedAt: "desc" }, take: 20,
    });
    return Response.json({ success: true, readings });
  } catch {
    return Response.json({ error: "Unable to load hardware readings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const account = await accountAccess({ write: true });
  if (account instanceof Response) return account;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid reading" }, { status: 400 });
  }
  const { tankId, temperature = null, distanceCm = null, emptyDistanceCm = null, fullDistanceCm = null } = body as Record<string, unknown>;
  const valid = (value: unknown, min: number, max: number): value is number =>
    typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
  if (typeof tankId !== "string" || !tankId ||
      (temperature !== null && !valid(temperature, -55, 125)) ||
      (distanceCm !== null && !valid(distanceCm, 2, 400)) ||
      (temperature === null && distanceCm === null)) {
    return Response.json({ error: "Provide a valid temperature (-55 to 125 C) or distance (2 to 400 cm)" }, { status: 400 });
  }
  let waterLevel: number | null = null;
  if (emptyDistanceCm !== null || fullDistanceCm !== null) {
    if (!valid(emptyDistanceCm, 2, 400) || !valid(fullDistanceCm, 2, 400) || emptyDistanceCm <= fullDistanceCm) {
      return Response.json({ error: "Empty distance must be greater than full distance; both must be 2 to 400 cm" }, { status: 400 });
    }
    if (typeof distanceCm === "number") {
      waterLevel = Math.round(Math.max(0, Math.min(100,
        (emptyDistanceCm - distanceCm) / (emptyDistanceCm - fullDistanceCm) * 100)) * 10) / 10;
    }
  }
  try {
    const tank = await prisma.tank.findUnique({ where: { id: tankId, userId: account.id }, select: { id: true } });
    if (!tank) return Response.json({ error: "Tank not found" }, { status: 404 });
    const reading = await prisma.hardwareTelemetry.create({
      data: { tankId, temperature: temperature as number | null, distanceCm: distanceCm as number | null, waterLevel },
    });
    return Response.json({ success: true, reading }, { status: 201 });
  } catch {
    return Response.json({ error: "Unable to save hardware reading" }, { status: 500 });
  }
}
