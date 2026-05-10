import { blob, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const apiAndRpcTable = sqliteTable('api_rpc', {
    id: integer('id', {mode: 'number'}).primaryKey({ autoIncrement: true }),
    createdAt: integer('created_at').notNull().default(sql`(cast(unixepoch() as int))`),
    encryptedApiKey: blob('private_key_encrypted').notNull(),
    rpc: text('rpc', {mode: 'text' }).notNull(),
});