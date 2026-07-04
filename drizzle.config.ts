import { defineConfig } from "drizzle-kit";

try {
  // Muat .env agar db:generate / db:studio bisa membaca DATABASE_URL tanpa set env manual.
  process.loadEnvFile();
} catch {
  // .env opsional (mis. env sudah tersedia dari environment CI/prod).
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});


