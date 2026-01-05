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

  // Create sample loan with all required fields (updated for new schema)
  const loan = await prisma.loan.upsert({
    where: { id: "loan-1" },
    update: {},
    create: {
      id: "loan-1",
      name: "Q4 2024 AI Infrastructure Financing",
      currency: "USD",
      principalAmount: 5000000,
      committedAmount: 5000000,
      drawnAmount: 3500000,
      type: "FIXED_RATE",
      startDate: new Date("2024-01-01"),
      maturityDate: new Date("2029-01-01"),
      borrowerOrgId: borrowerOrg.id,
      lenderOrgId: lenderOrg.id,
      createdByUserId: borrowerUser.id,
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
      valueType: "ABSOLUTE",
      direction: "LOWER_IS_BETTER",
      targetValue: 9.0,
      thresholdMin: 7.0,
      thresholdMax: 11.0,
      // calculationMethod: {
      //   formula:
      //     "(Total tCO₂e from AI GPU instances) / (Total AI compute hours) × 1000",
      //   description:
      //     "Total carbon emissions from AI workloads divided by total AI compute hours",
      // },
      // dataSources: [
      //   {
      //     type: "CLOUD",
      //     provider: "AWS",
      //     metric: "carbon-footprint",
      //   },
      // ],
      frequency: "ANNUAL",
      baselineValue: 12.5,
      status: "ACCEPTED",
      effectiveFrom: new Date("2024-01-01"),
      loanId: loan.id,
    },
  });

  const kpi2 = await prisma.kPI.upsert({
    where: { id: "kpi-2" },
    update: {},
    create: {
      id: "kpi-2",
      name: "Low-Carbon Region Usage",
      type: "AI_COMPUTE_HOURS",
      valueType: "PERCENTAGE",
      direction: "HIGHER_IS_BETTER",
      targetValue: 70.0,
      thresholdMin: 60.0,
      thresholdMax: 80.0,
      // calculationMethod: {
      //   formula:
      //     "(AI compute hours in low-carbon regions) / (Total AI compute hours) × 100",
      //   description:
      //     "Percentage of AI workloads running in regions with carbon intensity below 300 gCO2/kWh",
      // },
      // dataSources: [
      //   {
      //     type: "CLOUD",
      //     provider: "AWS",
      //     metric: "region-usage",
      //   },
      // ],
      frequency: "ANNUAL",
      baselineValue: 45.0,
      status: "ACCEPTED",
      effectiveFrom: new Date("2024-01-01"),
      loanId: loan.id,
    },
  });

  // Create sample margin ratchets
  await prisma.marginRatchet.upsert({
    where: { id: "ratchet-1" },
    update: {},
    create: {
      id: "ratchet-1",
      loanId: loan.id,
      kpiId: kpi1.id,
      stepUpBps: 15,
      stepDownBps: 15,
      maxAdjustmentBps: 50,
    },
  });

  await prisma.marginRatchet.upsert({
    where: { id: "ratchet-2" },
    update: {},
    create: {
      id: "ratchet-2",
      loanId: loan.id,
      kpiId: kpi2.id,
      stepUpBps: 10,
      stepDownBps: 10,
      maxAdjustmentBps: 30,
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
