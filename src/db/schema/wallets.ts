import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const walletTable = sqliteTable('wallets', {
    id: integer('id', {mode: 'number'}).primaryKey({ autoIncrement: true }),
    publicAddress: text('public_address').unique(),
    isMainWallet: integer('is_main_wallet', {mode: 'boolean'}),
    privateKeyEncrypted: blob('private_key_encrypted').notNull(),
    createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
});