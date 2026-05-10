import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './index.js';
import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from "path";
import { fileURLToPath } from "url";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite = new Database(path.resolve(process.cwd(), 'wallets.db'));
export const db = drizzle(sqlite, { schema });

migrate(db, {  migrationsFolder: path.join(__dirname, "migrations")  });