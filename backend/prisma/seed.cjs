const { PrismaClient } = require("@prisma/client");
const demo = require("../src/data/demo.json");

async function seed(prisma, userId) {
  if (!userId) throw new Error("An account ID is required to seed demo records");
  if (!await prisma.user.findUnique({ where: { id: userId } })) throw new Error("Account not found");
  return prisma.$transaction(async (db) => {
    if (await db.tank.count({ where: { userId } })) return { seeded: false };
    const now = Date.now();
    const ago = (hours) => new Date(now - hours * 3600000);
    const water = demo.waterQualityByTank[0];
    const growth = demo.growthByTank[0];
    const tank = await db.tank.create({
      data: {
        ...demo.tank,
        userId,
        telemetries: {
          create: {
            dissolvedOxygen: water.dissolvedOxygen,
            ph: water.ph,
            temperature: water.temperature,
            salinity: water.salinity,
            waterLevel: water.waterLevel,
          },
        },
        visionScans: {
          create: [
            ...demo.growthTrend.map((bodyLength, i) => ({
              bodyLength,
              weight: 18.2,
              population: 1720,
              notes: "Weekly growth sample",
              recordedAt: ago((7 - i) * 7 * 24),
            })),
            ...demo.visionScanLog.map((scan, i) => ({
              bodyLength: parseFloat(growth.bodyLength),
              weight: parseFloat(growth.weight),
              population: 1720,
              notes: scan.note,
              recordedAt: ago(i ? 24 : 0),
            })),
          ],
        },
        feedSchedules: {
          create: demo.feedSchedule.map((f) => ({
            timeSlot: f.time,
            amountKg: parseFloat(f.amount),
            status: f.status,
          })),
        },
        alerts: {
          create: demo.alertsLog.map((a, i) => ({
            userId,
            icon: a.icon,
            title: a.title,
            detail: a.detail,
            createdAt: ago([1, 3, 5, 11, 24][i]),
            resolved: i === 0,
          })),
        },
      },
    });
    await db.bioflocMetric.create({
      data: { userId, flocVolume: 12.4, cnRatio: 14.8, tss: 310, alkalinity: 148 },
    });
    await db.effluentLog.createMany({
      data: demo.effluentLog.map((e, i) => ({
        userId,
        tankId: tank.id,
        event: e.event,
        detail: e.detail,
        recordedAt: ago([6, 24, 48][i]),
        destination: i === 0 ? "wetland" : i === 1 ? "mangrove" : null,
        volumeL: i === 0 ? 220 : i === 1 ? 640 : null,
      })),
    });
    return { seeded: true };
  });
}
module.exports = { seed };
if (require.main === module) {
  const prisma = new PrismaClient();
  seed(prisma, process.env.SEED_USER_ID)
    .then((result) =>
      console.log(
        result.seeded
          ? "Demo records imported."
          : "Existing tanks found; no records changed.",
      ),
    )
    .catch(() => {
      console.error("Seed failed. Check the database connection and schema.");
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
