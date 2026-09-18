CREATE TABLE `garmin_activities` (
	`activity_id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`activity_type` text NOT NULL,
	`raw_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_garmin_activities_started_at` ON `garmin_activities` (`started_at`);--> statement-breakpoint
CREATE TABLE `garmin_health` (
	`health_date` text PRIMARY KEY NOT NULL,
	`raw_json` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_garmin_health_date` ON `garmin_health` (`health_date`);