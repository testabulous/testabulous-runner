CREATE TABLE `calls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`test_spec_definition_id` text NOT NULL,
	`test_spec_clause_id` text NOT NULL,
	`external_id` text,
	`call` text NOT NULL,
	`params` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clauses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`parent_id` text NOT NULL,
	`type` integer NOT NULL,
	`line` integer NOT NULL,
	`clause` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `definitions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`test_spec_id` text NOT NULL,
	`name` text NOT NULL,
	`line` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `script_data` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`hash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scripts` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`name` text NOT NULL,
	`uri` text NOT NULL,
	`script_type` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `test_specs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text,
	`status` integer NOT NULL,
	`script_data_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE INDEX `hash_idx` ON `script_data` (`hash`);