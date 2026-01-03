import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: 1,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
