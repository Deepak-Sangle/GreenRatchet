import "dotenv/config";
import { config } from "dotenv";
config();

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_2,
});
export const prisma = new PrismaClient({ adapter });
