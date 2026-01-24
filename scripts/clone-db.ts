// scripts/clone-db.ts

import { PrismaClient } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

// 1. Initialize Prisma Clients
const sourceAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const targetAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_2,
});

const sourcePrisma = new PrismaClient({ adapter: sourceAdapter });
const targetPrisma = new PrismaClient({ adapter: targetAdapter });

async function main() {
  const organizations = await sourcePrisma.organization.findMany();
  await targetPrisma.organization.createMany({ data: organizations });

  const users = await sourcePrisma.user.findMany();
  await targetPrisma.user.createMany({ data: users });

  const cloudData1 = await sourcePrisma.gridCarbonFreeEnergy.findMany();
  await targetPrisma.gridCarbonFreeEnergy.createMany({ data: cloudData1 });

  const cloudData2 = await sourcePrisma.gridCarbonIntensity.findMany();
  await targetPrisma.gridCarbonIntensity.createMany({ data: cloudData2 });

  const cloudData3 =
    await sourcePrisma.gridCarbonIntensityFossilOnly.findMany();
  await targetPrisma.gridCarbonIntensityFossilOnly.createMany({
    data: cloudData3,
  });

  const cloudData4 = await sourcePrisma.gridElectricityMix.findMany();
  await targetPrisma.gridElectricityMix.createMany({
    data: cloudData4,
  });

  const cloudData5 = await sourcePrisma.gridRenewableEnergy.findMany();
  await targetPrisma.gridRenewableEnergy.createMany({
    data: cloudData5,
  });

  const connections = await sourcePrisma.cloudConnection.findMany();
  await targetPrisma.cloudConnection.createMany({
    data: connections,
  });

  const cloudFootprintData = await sourcePrisma.cloudFootprint.findMany();
  await targetPrisma.cloudFootprint.createMany({ data: cloudFootprintData });

  await targetPrisma.$disconnect();
  await sourcePrisma.$disconnect();
}

main();
