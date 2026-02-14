import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";

export function createDatabase(url: string, authToken?: string) {
  return drizzle({
    connection: { url, authToken },
    schema,
  });
}

export type Database = ReturnType<typeof createDatabase>;
