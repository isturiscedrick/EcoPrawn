const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const projectRef = "uzedgsewqhehhnddlvsh";
async function main() {
  const candidate = process.env.SUPABASE_DATABASE_URL;
  if (!candidate) throw new Error("Save SUPABASE_DATABASE_URL in backend/.env first.");
  const url = new URL(candidate);
  const isDirect = url.hostname === `db.${projectRef}.supabase.co`;
  const isPooler = url.hostname.endsWith(".pooler.supabase.com") &&
    decodeURIComponent(url.username).endsWith(`.${projectRef}`);
  if (!isDirect && !isPooler) throw new Error("The database URL must belong to the selected Supabase project.");
  if (url.port === "6543") throw new Error("Use the Session pooler URL on port 5432 for this persistent backend.");
  url.searchParams.set("schema", "ecoprawn");
  url.searchParams.set("sslmode", "require");
  const prisma = new PrismaClient({ datasources: { db: { url: url.toString() } } });
  try {
    for (const model of ["tank", "sensorTelemetry", "visionScan", "feedSchedule", "bioflocMetric", "effluentLog", "alert", "user"]) {
      console.log(`${model}: ${await prisma[model].count()}`);
    }
  } finally {
    await prisma.$disconnect();
  }
  const envPath = path.resolve(__dirname, "../.env");
  const original = fs.readFileSync(envPath, "utf8");
  const backupPath = path.resolve(__dirname, "../.env.pre-supabase.local");
  if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, original, { flag: "wx" });
  const line = `DATABASE_URL="${url.toString()}"`;
  const updated = /^DATABASE_URL\s*=.*$/m.test(original)
    ? original.replace(/^DATABASE_URL\s*=.*$/m, () => line)
    : `${original}\n${line}\n`;
  fs.writeFileSync(envPath, updated);
  console.log("Supabase verified. DATABASE_URL updated; the previous connection was backed up privately.");
  console.log("Restart the backend and Prisma Studio to use Supabase.");
}
main().catch(() => {
  console.error("Connection not switched. Check SUPABASE_DATABASE_URL, the project reference, password, and Session pooler port 5432.");
  process.exitCode = 1;
});
