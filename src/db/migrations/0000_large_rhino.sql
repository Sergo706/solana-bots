CREATE TABLE `wallets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_address` text,
	`is_main_wallet` integer,
	`private_key_encrypted` blob NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `api_rpc` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL,
	`private_key_encrypted` blob NOT NULL,
	`rpc` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`wallet_address` text NOT NULL,
	`target_mint_address` text NOT NULL,
	`sol_amounts` numeric,
	`token_amount` numeric,
	`wallet_remaining_balance` numeric,
	`updated_at` integer DEFAULT (cast(unixepoch() as int)),
	FOREIGN KEY (`wallet_address`) REFERENCES `wallets`(`public_address`) ON UPDATE no action ON DELETE no action
);
