import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "./index.js";
import path from "path";
import fs from 'node:fs';
import os from 'node:os';
import Database from 'better-sqlite3';

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

 if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
const dbPath = path.join(dataDir, 'wallets.db');
const sqlite = new Database(dbPath, { timeout: 10000 });
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA synchronous = NORMAL;');

export const db = drizzle({ client: sqlite, schema });
const appDir = process.env.NODE_ENV === 'development' 
  ? path.join(process.cwd(), '..') 
  : path.dirname(process.execPath);
const migrationsFolder = path.join(appDir, "src/db/migrations");

if (process.env['CLI_BUILD']) {
  void migrate(db, { 
    migrationsFolder
  });
}

export const migrateForElec = (customFolder?: string) => {
  const dir = customFolder ?? migrationsFolder;
migrate(db, { 
  migrationsFolder: dir
});
return;
};
