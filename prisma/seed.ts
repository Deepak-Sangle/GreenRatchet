import "dotenv/config";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");

  // Create borrower organization
  const borrowerOrg = await prisma.organization.upsert({
    where: { id: "borrower-org-1" },
    update: {},
    create: {
      id: "borrower-org-1",
      name: "TechCorp AI",
      type: "BORROWER",
    },
  });

  // Create lender organization
  const lenderOrg = await prisma.organization.upsert({
    where: { id: "lender-org-1" },
    update: {},
    create: {
      id: "lender-org-1",
      name: "Green Capital Bank",
      type: "LENDER",
    },
  });

  // Create borrower user
  const hashedPasswordBorrower = await bcrypt.hash("password123", 10);
  const borrowerUser = await prisma.user.upsert({
    where: { email: "borrower@techcorp.ai" },
    update: {},
    create: {
      id: "borrower-user-1",
      email: "borrower@techcorp.ai",
      password: hashedPasswordBorrower,
      name: "Alice Johnson",
      role: "BORROWER",
      organizationId: borrowerOrg.id,
    },
  });

  // Create lender user
  const hashedPasswordLender = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "lender@greencapital.com" },
    update: {},
    create: {
      id: "lender-user-1",
      email: "lender@greencapital.com",
      password: hashedPasswordLender,
      name: "Bob Smith",
      role: "LENDER",
      organizationId: lenderOrg.id,
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
      organizationId: borrowerOrg.id,
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
      organizationId: borrowerOrg.id,
    },
  });

  console.log("Seed data created successfully!");
  console.log("\nDemo Credentials:");
  console.log("Borrower: borrower@techcorp.ai / password123");
  console.log("Lender: lender@greencapital.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
