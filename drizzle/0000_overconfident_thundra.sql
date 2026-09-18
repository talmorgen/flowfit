CREATE TABLE `app_state` (
	`owner_key` text PRIMARY KEY NOT NULL,
	`plans_json` text,
	`week_plan_json` text,
	`matches_json` text,
	`exercise_bank_json` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_sets` (
	`set_id` text PRIMARY KEY NOT NULL,
	`workout_id` text NOT NULL,
	`workout_started_at` text,
	`plan_id` integer,
	`plan_name` text NOT NULL,
	`exercise_id` integer,
	`exercise_name` text NOT NULL,
	`set_number` integer NOT NULL,
	`reps` integer NOT NULL,
	`weight_kg` text NOT NULL,
	`rpe` integer,
	`notes` text,
	`performed_at` text NOT NULL,
	`set_duration_sec` integer
);
