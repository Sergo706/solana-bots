import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./index.js";
import path from "path";
import fs from 'node:fs';
import os from 'node:os';

const dataDir =
  process.platform === "win32"
    ? path.join(process.env["APPDATA"] ?? path.join(os.homedir(), 'AppData', 'Roaming'), "SolanaBot")
    : path.join(os.homedir(), ".solana-bot");

 if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

export const db = drizzle({ connection: { url: `file:${dataDir}/wallets.db`} ,schema });

// const appDir = path.dirname(process.execPath);
// const migrationsFolder = path.join(appDir, "migrations");

// void migrate(db, { 
//   migrationsFolder
// });
