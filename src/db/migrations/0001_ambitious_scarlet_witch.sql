CREATE TABLE `api_rpc` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch() as int)) NOT NULL,
	`private_key_encrypted` blob NOT NULL,
	`rpc` text NOT NULL
);
