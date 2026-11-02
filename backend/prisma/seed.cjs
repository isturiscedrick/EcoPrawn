const { PrismaClient } = require("@prisma/client");
if (require.main === module) {
  const prisma = new PrismaClient();
  import("./seed.mjs").then(({ seed }) => seed(prisma, process.env.SEED_USER_ID))
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
