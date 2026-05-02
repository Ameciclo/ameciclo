CREATE TABLE `contagem` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`local_name` text NOT NULL,
	`started_at` text NOT NULL,
	`timezone` text DEFAULT 'America/Recife' NOT NULL,
	`bucket_minutes` integer NOT NULL,
	`bucket_count` integer NOT NULL,
	`latitude` real,
	`longitude` real,
	`topology` text NOT NULL,
	`notes` text,
	`schema` text DEFAULT 'ameciclo.v1' NOT NULL,
	`data` text NOT NULL,
	`total_cyclists` integer GENERATED ALWAYS AS (json_extract("data", '$.totals.cyclists')) STORED,
	`peak_bucket_count` integer GENERATED ALWAYS AS (json_extract("data", '$.totals.peakBucketCount')) STORED,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_local_date` ON `contagem` (`local_name`,date("started_at"));