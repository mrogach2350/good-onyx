import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "./schema";
export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
});

if (process.env.MIGRATE === "true") {
  void migrate(db, { migrationsFolder: "./drizzle" });
}
