import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "user-1",
        name: "Ahmad Rizky",
        email: "ahmad@cygnus.id",
        role: "ADMIN",
        nim: "2101234567",
        faculty: "Teknik Informatika",
        skills: ["Frontend", "Backend", "AI/ML"],
      },
    }),
    prisma.user.create({
      data: {
        id: "user-2",
        name: "Budi Santoso",
        email: "budi@cygnus.id",
        role: "TEAM_LEADER",
        nim: "2101234568",
        faculty: "Sistem Informasi",
        skills: ["UI/UX", "Frontend", "Mobile"],
      },
    }),
    prisma.user.create({
      data: {
        id: "user-3",
        name: "Citra Dewi",
        email: "citra@cygnus.id",
        role: "MEMBER",
        nim: "2101234569",
        faculty: "Teknik Komputer",
        skills: ["Data Science", "Research", "Writing"],
      },
    }),
    prisma.user.create({
      data: {
        id: "user-4",
        name: "Diana Putri",
        email: "diana@cygnus.id",
        role: "MEMBER",
        nim: "2101234570",
        faculty: "Teknik Informatika",
        skills: ["Cyber Security", "CTF", "Backend"],
      },
    }),
    prisma.user.create({
      data: {
        id: "user-5",
        name: "Eko Prasetyo",
        email: "eko@cygnus.id",
        role: "MEMBER",
        nim: "2101234571",
        faculty: "Sistem Informasi",
        skills: ["Business Case", "Writing", "Research"],
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Create competitions
  const comp1 = await prisma.competition.create({
    data: {
      id: "comp-1",
      name: "Hackathon AI Indonesia 2026",
      organizer: "Google Developer Student Clubs",
      website: "https://hackathon-ai.id",
      level: "NATIONAL",
      category: "HACKATHON",
      description: "Kompetisi hackathon terbesar di Indonesia dengan fokus pada implementasi AI.",
      prizePool: "Rp 500.000.000",
      certificate: true,
      funding: true,
      incubation: true,
      status: "FINAL",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-06-20"),
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
