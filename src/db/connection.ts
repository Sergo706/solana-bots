/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
import * as schema from "./index.js";
import path from "path";
import fs from 'node:fs';
import os from 'node:os';
import consola from "consola";
import type { BunSQLiteDatabase } from "drizzle-orm/bun-sqlite";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

type AppDatabase = BunSQLiteDatabase<typeof schema> | BetterSQLite3Database<typeof schema>;

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

 if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  


const dbPath = path.join(dataDir, 'wallets.db');
const isBun = (typeof process.versions !== 'undefined' && process.versions.bun !== undefined) || process.env['CLI_BUILD'];
let db: AppDatabase;

if (isBun) {
  const { Database } = await import(/* @vite-ignore */ "bun:sqlite");
  const { drizzle } = await import(/* @vite-ignore */ "drizzle-orm/bun-sqlite");
  const sqlite = new Database(dbPath);

  sqlite.run('PRAGMA journal_mode = WAL;');
  sqlite.run('PRAGMA synchronous = NORMAL;');
  db = drizzle(sqlite, { schema });

  const { migrate } = await import(/* @vite-ignore */ "drizzle-orm/bun-sqlite/migrator");
  const isCompiled = !process.execPath.endsWith("bun");

  const migrationsFolder = isCompiled 
      ? path.join(path.dirname(process.execPath), "../migrations")
      : path.join(process.cwd(), "src/db/migrations");

  if (fs.existsSync(migrationsFolder)) {
      migrate(db, { migrationsFolder });
    } else {
      consola.warn(`Migrations folder not found at ${migrationsFolder}. DB Migration skipped.`);
  }

} else {
  const Database = (await import('better-sqlite3')).default;
  const { drizzle } = await import('drizzle-orm/better-sqlite3');

  const sqlite = new Database(dbPath, { timeout: 10000 });
  sqlite.exec('PRAGMA journal_mode = WAL;');
  sqlite.exec('PRAGMA synchronous = NORMAL;');
  db = drizzle({ client: sqlite, schema });
}


export { db };

export const migrateForElec = async (customFolder?: string) => {
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const appDir = process.env.NODE_ENV === 'development' 
  ? path.join(process.cwd(), '..') 
  : path.dirname(process.execPath);

  const migrationsFolder = path.join(appDir, "src/db/migrations");

  const dir = customFolder ?? migrationsFolder;

migrate(db as BetterSQLite3Database<typeof schema>, { 
  migrationsFolder: dir
});
return;
};

