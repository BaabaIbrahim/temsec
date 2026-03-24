import { createDatabase } from "@kilocode/app-builder-db";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

type Schema = typeof schema;

let client: SqliteRemoteDatabase<Schema> | null = null;

export function getDb(): SqliteRemoteDatabase<Schema> {
  if (client) return client;
  client = createDatabase(schema);
  return client;
}
