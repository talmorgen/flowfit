CREATE INDEX `idx_training_sets_exercise_time` ON `training_sets` (`exercise_name`,`performed_at`);--> statement-breakpoint
CREATE INDEX `idx_training_sets_workout` ON `training_sets` (`workout_id`);