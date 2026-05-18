import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { walletTable } from './wallets';



export const positionsTable = sqliteTable('positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletAddress: text('wallet_address').notNull().references(() => walletTable.publicAddress, { onDelete: 'cascade' }),
  targetMintAddress: text('target_mint_address').notNull(),
  solAmounts: numeric('sol_amounts', { mode: 'bigint' }),
  tokenAmount: numeric('token_amount', { mode: 'bigint' }),
  walletRemainingBalance: numeric("wallet_remaining_balance", { mode: 'bigint' }),
  updatedAt: integer('updated_at', {mode: 'timestamp'}).default(sql`(cast(unixepoch() as int))`),
});