import "dotenv/config";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  const org = await prisma.organization.upsert({
    where: { id: "org-1" },
    update: {},
    create: {
      id: "org-1",
      name: "TechCorp AI",
    },
  });

  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "user@techcorp.ai" },
    update: {},
    create: {
      id: "user-1",
      email: "user@techcorp.ai",
      password: hashedPassword,
      name: "Alice Johnson",
      organizationId: org.id,
    },
  });

  // Create sample KPIs with new structure
  const kpi1 = await prisma.kPI.upsert({
    where: { id: "kpi-1" },
    update: {},
    create: {
      id: "kpi-1",
      name: "AI Carbon Intensity",
      type: "CO2_EMISSION",
      direction: "LOWER_IS_BETTER",
      targetValue: 9.0,
      thresholdMin: 7.0,
      thresholdMax: 11.0,
      frequency: "ANNUAL",
      baselineValue: 12.5,
      effectiveFrom: new Date("2024-01-01"),
      organizationId: org.id,
    },
  });

  const kpi2 = await prisma.kPI.upsert({
    where: { id: "kpi-2" },
    update: {},
    create: {
      id: "kpi-2",
      name: "Low-Carbon Region Usage",
      type: "LOW_CARBON_REGION_PERCENTAGE",
      direction: "HIGHER_IS_BETTER",
      targetValue: 70.0,
      thresholdMin: 60.0,
      thresholdMax: 80.0,
      frequency: "ANNUAL",
      baselineValue: 45.0,
      effectiveFrom: new Date("2024-01-01"),
      organizationId: org.id,
    },
  });

  console.log("Seed data created successfully!");
  console.log("\nDemo Credentials:");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
