import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const rpcTable = sqliteTable('rpc_nodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  provider: text('provider').notNull(), // 'helius', 'alchemy', etc.
  type: text('type').notNull(), // 'free' | 'paid'
  encryptedApiKey: blob('private_key_encrypted').notNull(),
  priority: integer('priority').default(1), // Higher = used first
  is_active: integer('is_active', { mode: 'boolean' }).default(true),
  last_error_at: integer('last_error_at'), // Unix timestamp
  error_count: integer('error_count').default(0),
});