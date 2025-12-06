import 'dotenv/config'; // Loads .env.local
import { defineConfig, env } from '@prisma/config'; // Prisma 7 config

export default defineConfig({
  schema: './prisma/schema.prisma', // Path to your schema
  datasource: {
    url: env('DATABASE_URL'), // Pulls from .env.local
  },
  // Optional: Migrations path
  migrations: {
    path: './prisma/migrations',
  },
});