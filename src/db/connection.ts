import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './index.js';
import Database from 'better-sqlite3';


const sqlite = new Database('wallets.db', { verbose: console.log });
export const db = drizzle(sqlite, { schema });
