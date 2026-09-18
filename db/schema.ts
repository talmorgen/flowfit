import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const appState = sqliteTable('app_state', {
  ownerKey: text('owner_key').primaryKey(),
  plansJson: text('plans_json'),
  weekPlanJson: text('week_plan_json'),
  matchesJson: text('matches_json'),
  exerciseBankJson: text('exercise_bank_json'),
  updatedAt: text('updated_at').notNull(),
});

export const trainingSets = sqliteTable('training_sets', {
  setId: text('set_id').primaryKey(),
  workoutId: text('workout_id').notNull(),
  workoutStartedAt: text('workout_started_at'),
  planId: integer('plan_id'),
  planName: text('plan_name').notNull(),
  exerciseId: integer('exercise_id'),
  exerciseName: text('exercise_name').notNull(),
  setNumber: integer('set_number').notNull(),
  reps: integer('reps').notNull(),
  weightKg: text('weight_kg').notNull(),
  rpe: integer('rpe'),
  notes: text('notes'),
  performedAt: text('performed_at').notNull(),
  setDurationSec: integer('set_duration_sec'),
}, (table) => [
  index('idx_training_sets_exercise_time').on(table.exerciseName, table.performedAt),
  index('idx_training_sets_workout').on(table.workoutId),
]);
