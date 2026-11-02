CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`user_id` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`tag` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`due` integer NOT NULL,
	`stability` real DEFAULT 0 NOT NULL,
	`difficulty` real DEFAULT 0 NOT NULL,
	`scheduled_days` integer DEFAULT 0 NOT NULL,
	`learning_steps` integer DEFAULT 0 NOT NULL,
	`reps` integer DEFAULT 0 NOT NULL,
	`lapses` integer DEFAULT 0 NOT NULL,
	`state` integer DEFAULT 0 NOT NULL,
	`last_review` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cards_user_due_idx` ON `cards` (`user_id`,`due`);--> statement-breakpoint
CREATE INDEX `cards_deck_idx` ON `cards` (`deck_id`);--> statement-breakpoint
CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `decks_user_idx` ON `decks` (`user_id`);--> statement-breakpoint
CREATE TABLE `draft_cards` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`chunk_index` integer NOT NULL,
	`position` integer NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`tag` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`duplicate_of` text,
	FOREIGN KEY (`job_id`) REFERENCES `generation_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `draft_cards_job_idx` ON `draft_cards` (`job_id`,`chunk_index`,`position`);--> statement-breakpoint
CREATE TABLE `generation_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`index` integer NOT NULL,
	`page_from` integer,
	`page_to` integer,
	`target_count` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `generation_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `generation_chunks_job_idx_uq` ON `generation_chunks` (`job_id`,`index`);--> statement-breakpoint
CREATE TABLE `generation_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`deck_id` text NOT NULL,
	`source` text NOT NULL,
	`source_name` text,
	`requested_count` integer NOT NULL,
	`total_chunks` integer NOT NULL,
	`done_chunks` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`deck_id`) REFERENCES `decks`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `generation_jobs_user_idx` ON `generation_jobs` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limit_hits` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`ts` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `rate_limit_key_ts_idx` ON `rate_limit_hits` (`key`,`ts`);--> statement-breakpoint
CREATE TABLE `review_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`card_id` text NOT NULL,
	`user_id` text NOT NULL,
	`rating` integer NOT NULL,
	`state` integer NOT NULL,
	`due` integer NOT NULL,
	`stability` real NOT NULL,
	`difficulty` real NOT NULL,
	`scheduled_days` integer NOT NULL,
	`learning_steps` integer NOT NULL,
	`review_at` integer NOT NULL,
	`duration_ms` integer,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `review_logs_user_time_idx` ON `review_logs` (`user_id`,`review_at`);--> statement-breakpoint
CREATE INDEX `review_logs_card_idx` ON `review_logs` (`card_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);