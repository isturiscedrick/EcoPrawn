import { accountAccess } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const account = await accountAccess({ write: false, admin: false });
  if (account instanceof Response) return account;
  try {
    const [tanks, scans, schedules, metrics, logs, events, readings] =
      await Promise.all([
        prisma.tank.findMany({
          where: { userId: account.id },
          orderBy: { createdAt: "asc" },
          include: {
            telemetries: { orderBy: { recordedAt: "desc" }, take: 1 },
            visionScans: { orderBy: { recordedAt: "desc" }, take: 1 },
          },
        }),
        prisma.visionScan.findMany({
          where: { tank: { userId: account.id } },
          orderBy: { recordedAt: "desc" },
          take: 100,
          include: { tank: { select: { name: true } } },
        }),
        prisma.feedSchedule.findMany({
          where: { tank: { userId: account.id } },
          orderBy: [{ timeSlot: "asc" }, { tankId: "asc" }],
        }),
        prisma.bioflocMetric.findFirst({
          where: { userId: account.id }, orderBy: { recordedAt: "desc" } }),
        prisma.effluentLog.findMany({
          where: { userId: account.id },
          orderBy: { recordedAt: "desc" },
          take: 100,
        }),
        prisma.alert.findMany({
          where: { userId: account.id }, orderBy: { createdAt: "desc" }, take: 100 }),
        prisma.sensorTelemetry.findMany({
          where: { tank: { userId: account.id } },
          orderBy: { recordedAt: "desc" },
          take: 100,
        }),
      ]);
    const time = (date: Date) => date.toISOString();
    return Response.json({
      success: true,
      tanks,
      waterTrend: [...readings]
        .reverse()
        .map((r) => ({ tankId: r.tankId, value: r.dissolvedOxygen })),
      growthTrend: [...scans].reverse().map((s) => s.bodyLength),
      visionScanLog: scans.map((s) => ({
        id: s.id,
        time: time(s.recordedAt),
        tank: s.tank.name,
        note: s.notes || "Scan recorded",
      })),
      feedSchedule: schedules.map((s) => ({
        id: s.id,
        time: s.timeSlot,
        amount: `${s.amountKg} kg`,
        status: s.status,
      })),
      bioflocMetrics: metrics
        ? [
            {
              label: "Floc Volume (FV)",
              value: String(metrics.flocVolume),
              unit: "mL/L",
              status: "ok",
            },
            {
              label: "C:N Ratio",
              value: String(metrics.cnRatio),
              unit: ":1",
              status: "ok",
            },
            {
              label: "Total Suspended Solids",
              value: String(metrics.tss),
              unit: "mg/L",
              status: "ok",
            },
            {
              label: "Alkalinity",
              value: String(metrics.alkalinity),
              unit: "mg/L CaCO₃",
              status: "ok",
            },
          ]
        : [],
      effluentLog: logs.map((l) => ({
        id: l.id,
        time: time(l.recordedAt),
        event: l.event,
        detail: l.detail,
      })),
      alertsLog: events.map((e) => ({
        icon: e.icon === "warn" ? "warn" : "info",
        title: e.title,
        detail: e.detail,
        time: time(e.createdAt),
      })),
      resolvedAlerts: events.filter((e) => e.resolved).length,
    });
  } catch {
    return Response.json(
      { success: false, error: "Unable to load dashboard data" },
      { status: 500 },
    );
  }
}
