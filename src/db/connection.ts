import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./index.js";
import path from "path";
import { Database } from "bun:sqlite";
import fs from 'node:fs';
import os from 'node:os';


const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

 if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

const sqlite = new Database(
  path.resolve(dataDir, "wallets.db")
);

export const db = drizzle(sqlite, { schema });

const appDir = path.dirname(process.execPath);
const migrationsFolder = path.join(appDir, "migrations");

migrate(db, { 
  migrationsFolder
});
