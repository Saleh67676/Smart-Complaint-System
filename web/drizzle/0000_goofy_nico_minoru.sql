CREATE TABLE `exchanges` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`reply` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `request_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`context` text DEFAULT '[]' NOT NULL,
	`attempt` integer DEFAULT 0 NOT NULL,
	`busy_until` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`details` text NOT NULL,
	`department` text NOT NULL,
	`score` real NOT NULL,
	`status` text DEFAULT 'recorded' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tickets_token_hash_unique` ON `tickets` (`token_hash`);