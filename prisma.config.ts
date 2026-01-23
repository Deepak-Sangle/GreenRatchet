import "dotenv/config";
import { defineConfig, PrismaConfig, env } from "prisma/config";

const config: PrismaConfig = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    // Always use DIRECT_URL for migrations to work
    url: env("DIRECT_URL"),
  },
};

export default defineConfig(config);
