import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const baseConnectionString =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL;

function resolveConnectionString(url: string) {
  const parsed = new URL(url);

  if (parsed.hostname.includes("-pooler.") && parsed.hostname.includes("neon.tech")) {
    parsed.hostname = parsed.hostname.replace("-pooler", "");
  }

  parsed.searchParams.delete("options");
  return parsed.toString();
}

function createMissingDbProxy() {
  return new Proxy(
    {},
    {
      get() {
        throw new Error("DATABASE_URL is not configured.");
      }
    }
  );
}

export const db = baseConnectionString
  ? drizzle(
      postgres(resolveConnectionString(baseConnectionString), {
        prepare: false,
        max: 1
      }),
      { schema }
    )
  : (createMissingDbProxy() as ReturnType<typeof drizzle<typeof schema>>);
