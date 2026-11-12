import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrationen brauchen eine direkte Verbindung (Supabase: Session Pooler, Port 5432)
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
