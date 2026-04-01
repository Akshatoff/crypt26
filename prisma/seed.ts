import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── SCHOOL DATA ─────────────────────────────────────────────
const schools = [
  { code: "890256", name: "Tagore International School Vasant Vihar" },
  { code: "213847", name: "Tagore International School East of Kailash" },
  { code: "917266", name: "ST. MARK'S SR. SEC. PUBLIC SCHOOL" },
  { code: "281956", name: "Air force Golden Jubilee Institute" },
  { code: "827047", name: "Nirmal Bhartia School" },
  { code: "212366", name: "Amity International School Sector-46" },
  { code: "329856", name: "BAL BHARATI PUBLIC SCHOOL" },
  { code: "130247", name: "The Indian School" },
  { code: "231966", name: "MOUNT ST. MARY'S SCHOOL" },
  { code: "984156", name: "DPS ROHINI" },
  { code: "423047", name: "CHINMAYA VIDYALAYA" },
  { code: "429966", name: "Delhi Public School, R. K. Puram" },
  { code: "975856", name: "Lotus Valley International School Gurugram" },
  { code: "498847", name: "St. Columba's School" },
  { code: "108466", name: "New Era Public School" },
  { code: "320356", name: "Delhi Public School, Gurgaon" },
  { code: "490947", name: "Delhi Public School Sushant Lok" },
  { code: "768966", name: "Nirmal Bhartia School" },
  { code: "342416", name: "Indraprastha International School" },
  { code: "452713", name: "Mayoor School Noida" },
  { code: "347812", name: "Prudence School Ashok Vihar" },
  { code: "123456", name: "Crypt Ka Raja" }, // dev/test school
];

// ─── CORRECT ANSWERS PER LEVEL ───────────────────────────────
// These match question.json exactly (normalized: lowercase, no spaces)
// Storing the canonical answer for each level in CorrectAttempt
const correctAnswers = [
  { level: 1,  attempt: "cskfinals" },
  { level: 2,  attempt: "annaparu" },
  { level: 3,  attempt: "terry" },
  { level: 4,  attempt: "beachsidecoconut" },
  { level: 5,  attempt: "arrowverse" },
  { level: 6,  attempt: "minecraft" },
  { level: 7,  attempt: "fivehundredsixty" },
  { level: 8,  attempt: "jootahaijapani" },
  { level: 9,  attempt: "ether" },
  { level: 10, attempt: "morty" },
  { level: 11, attempt: "zabuza" },
  { level: 12, attempt: "703.2" },
  { level: 13, attempt: "kendricklamar" },
  { level: 14, attempt: "9.4 trillion kilometers" },
  { level: 15, attempt: "oliver" },
];

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Upsert Schools ──────────────────────────────────────
  console.log("📚 Seeding schools...");
  let schoolsSeeded = 0;

  for (const school of schools) {
    await prisma.school.upsert({
      where: { code: school.code },
      update: { name: school.name }, // keep score/level intact on re-seed
      create: {
        code: school.code,
        name: school.name,
        score: 0,
        level: 1,
      },
    });
    schoolsSeeded++;
    console.log(`  ✓ [${school.code}] ${school.name}`);
  }

  console.log(`\n  → ${schoolsSeeded} schools seeded.\n`);

  // ── 2. Upsert Correct Answers ──────────────────────────────
  console.log("🔑 Seeding correct answers...");

  // Clear existing CorrectAttempt rows and re-insert for clean state
  await prisma.correctAttempt.deleteMany({});

  for (const ca of correctAnswers) {
    await prisma.correctAttempt.create({
      data: {
        level: ca.level,
        attempt: ca.attempt,
      },
    });
    console.log(`  ✓ Level ${String(ca.level).padStart(2, "0")} → "${ca.attempt}"`);
  }

  console.log(`\n  → ${correctAnswers.length} correct answers seeded.\n`);

  // ── 3. Summary ─────────────────────────────────────────────
  const schoolCount = await prisma.school.count();
  const caCount = await prisma.correctAttempt.count();

  console.log("─".repeat(50));
  console.log(`✅ Seed complete!`);
  console.log(`   Schools in DB      : ${schoolCount}`);
  console.log(`   Correct answers    : ${caCount}`);
  console.log("─".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
