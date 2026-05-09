CREATE TABLE `wallets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`public_address` text,
	`is_main_wallet` integer,
	`private_key_encrypted` blob NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL
);
