import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

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

export const db = connectionString
  ? drizzle(
      postgres(connectionString, {
        prepare: false,
        max: 1
      }),
      { schema }
    )
  : (createMissingDbProxy() as ReturnType<typeof drizzle<typeof schema>>);
