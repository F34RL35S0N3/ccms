/**
 * Seed script — populate Supabase dengan semua user dari mock-data.ts
 * Jalankan: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const users = [
    {
      id: "user-1",
      name: "Ahmad Rizky",
      email: "ahmad@cygnus.id",
      password: "password123",
      role: "ADMIN" as const,
      nim: "2101234567",
      faculty: "Teknik Informatika",
      skills: ["Frontend", "Backend", "AI/ML"],
    },
    {
      id: "user-2",
      name: "Budi Santoso",
      email: "budi@cygnus.id",
      password: "password123",
      role: "TEAM_LEADER" as const,
      nim: "2101234568",
      faculty: "Sistem Informasi",
      skills: ["UI/UX", "Frontend", "Mobile"],
    },
    {
      id: "user-3",
      name: "Citra Dewi",
      email: "citra@cygnus.id",
      password: "password123",
      role: "MEMBER" as const,
      nim: "2101234569",
      faculty: "Teknik Komputer",
      skills: ["Data Science", "Research", "Writing"],
    },
    {
      id: "user-4",
      name: "Diana Putri",
      email: "diana@cygnus.id",
      password: "password123",
      role: "MEMBER" as const,
      nim: "2101234570",
      faculty: "Teknik Informatika",
      skills: ["Cyber Security", "CTF", "Backend"],
    },
    {
      id: "user-5",
      name: "Eko Prasetyo",
      email: "eko@cygnus.id",
      password: "password123",
      role: "MEMBER" as const,
      nim: "2101234571",
      faculty: "Sistem Informasi",
      skills: ["Business Case", "Writing", "Research"],
    },
    {
      id: "user-6",
      name: "Jovan",
      email: "jovan@cygnus.id",
      password: "jovan123",
      role: "MEMBER" as const,
      nim: "2101234572",
      faculty: "Teknik Informatika",
      skills: ["Frontend", "UI/UX"],
    },
    {
      id: "user-7",
      name: "Jonathan",
      email: "jonathan@cygnus.id",
      password: "jonathan123",
      role: "ADMIN" as const,
      nim: "2101234573",
      faculty: "Teknik Informatika",
      skills: ["Backend", "AI/ML", "Data Science"],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const userData of users) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      console.log(`  ⏭️  Skip (sudah ada): ${userData.email}`);
      skipped++;
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.create({
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        nim: userData.nim,
        faculty: userData.faculty,
        skills: userData.skills,
      } as any,
    });

    console.log(`  ✅ Created: ${userData.name} (${userData.email})`);
    created++;
  }

  console.log(`\n🎉 Seeding selesai! Created: ${created}, Skipped: ${skipped}`);
  console.log("\n📋 Akun yang tersedia:");
  console.log("  jonathan@cygnus.id  / jonathan123  (ADMIN)");
  console.log("  ahmad@cygnus.id     / password123  (ADMIN)");
  console.log("  budi@cygnus.id      / password123  (TEAM_LEADER)");
  console.log("  jovan@cygnus.id     / jovan123     (MEMBER)");
  console.log("  [+ 3 user lainnya]  / password123  (MEMBER)");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
