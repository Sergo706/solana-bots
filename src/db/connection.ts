import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./index.js";
import path from "path";
import { Database } from "bun:sqlite";


const baseDir = path.dirname(process.execPath);

const sqlite = new Database(
  path.resolve(baseDir, "wallets.db")
);

export const db = drizzle(sqlite, { schema });

const migrationsFolder = path.join(baseDir, "migrations");

migrate(db, {
  migrationsFolder
});
