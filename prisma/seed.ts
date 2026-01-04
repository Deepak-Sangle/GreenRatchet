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
      email: "lender@greencapital.com",
      password: hashedPasswordLender,
      name: "Bob Smith",
      role: "LENDER",
      organizationId: lenderOrg.id,
    },
  });

  // Create sample loan
  const loan = await prisma.loan.upsert({
    where: { id: "loan-1" },
    update: {},
    create: {
      id: "loan-1",
      name: "Q4 2024 AI Infrastructure Financing",
      currency: "USD",
      observationPeriod: "Annual",
      marginRatchetBps: 25,
      borrowerOrgId: borrowerOrg.id,
      lenderOrgId: lenderOrg.id,
    },
  });

  // Create sample KPIs
  await prisma.kPI.upsert({
    where: { id: "kpi-1" },
    update: {},
    create: {
      id: "kpi-1",
      name: "AI Carbon Intensity",
      definition:
        "Total carbon emissions from AI workloads divided by total AI compute hours, measured in tonnes CO2e per 1,000 AI compute hours",
      metricFormula:
        "(Total tCO₂e from AI GPU instances) / (Total AI compute hours) × 1000",
      unit: "tCO₂e / 1,000 AI hours",
      baselineValue: 12.5,
      targetValue: 9.0,
      observationPeriod: "Annual",
      marginImpactBps: 15,
      status: "ACCEPTED",
      loanId: loan.id,
    },
  });

  await prisma.kPI.upsert({
    where: { id: "kpi-2" },
    update: {},
    create: {
      id: "kpi-2",
      name: "Low-Carbon Region Usage",
      definition:
        "Percentage of AI workloads running in regions with carbon intensity below 300 gCO2/kWh",
      metricFormula:
        "(AI compute hours in low-carbon regions) / (Total AI compute hours) × 100",
      unit: "%",
      baselineValue: 45.0,
      targetValue: 70.0,
      observationPeriod: "Annual",
      marginImpactBps: 10,
      status: "ACCEPTED",
      loanId: loan.id,
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
