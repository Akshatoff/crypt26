/**
 * reset-seed.ts
 *
 * USE WITH CAUTION — resets all competition data:
 *   - Clears all Attempt records
 *   - Resets all School scores → 0 and levels → 1
 *   - Resets all User scores → 0, levels → 1, finished → false
 *   - Does NOT delete users, schools, or accounts
 *
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/reset-seed.ts
 *   or add to package.json: "db:reset": "ts-node prisma/reset-seed.ts"
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️  RESET SEED — This will wipe all competition progress!\n");

  // ── Delete all attempts ────────────────────────────────────
  const deletedAttempts = await prisma.attempt.deleteMany({});
  console.log(`🗑  Deleted ${deletedAttempts.count} attempt records.`);

  // ── Reset all school scores and levels ────────────────────
  const updatedSchools = await prisma.school.updateMany({
    data: { score: 0, level: 1 },
  });
  console.log(`🔄 Reset ${updatedSchools.count} school scores/levels to 0/1.`);

  // ── Reset all user scores and levels ──────────────────────
  const updatedUsers = await prisma.user.updateMany({
    data: { score: 0, level: 1, finished: false },
  });
  console.log(`🔄 Reset ${updatedUsers.count} user scores/levels to 0/1.\n`);

  console.log("✅ Reset complete. Run seed.ts to re-seed base data.");
}

main()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
