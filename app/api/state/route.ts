import { env } from 'cloudflare:workers';

const ownerKey = 'primary';
const stateFields = {
  plans: 'plans_json',
  weekPlan: 'week_plan_json',
  matches: 'matches_json',
  exerciseBank: 'exercise_bank_json',
} as const;

async function ensureTables() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS app_state (owner_key TEXT PRIMARY KEY, plans_json TEXT, week_plan_json TEXT, matches_json TEXT, exercise_bank_json TEXT, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS training_sets (set_id TEXT PRIMARY KEY, workout_id TEXT NOT NULL, workout_started_at TEXT, plan_id INTEGER, plan_name TEXT NOT NULL, exercise_id INTEGER, exercise_name TEXT NOT NULL, set_number INTEGER NOT NULL, reps INTEGER NOT NULL, weight_kg TEXT NOT NULL, rpe INTEGER, notes TEXT, performed_at TEXT NOT NULL, set_duration_sec INTEGER)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_training_sets_exercise_time ON training_sets (exercise_name, performed_at DESC)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_training_sets_workout ON training_sets (workout_id)'),
  ]);
}

function parseJson(value: unknown) {
  if (typeof value !== 'string' || !value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

async function importLegacySets() {
  if (!env.GOOGLE_SHEETS_ENDPOINT || !env.GOOGLE_SHEETS_SECRET) return;
  const response = await fetch(env.GOOGLE_SHEETS_ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getRecentSets', limit: 500, secret: env.GOOGLE_SHEETS_SECRET }) });
  const data = await response.json() as { ok?: boolean; sets?: Array<Record<string, unknown>> };
  if (!data.ok || !data.sets?.length) return;
  const statements = data.sets.map((set, index) => env.DB.prepare('INSERT OR IGNORE INTO training_sets (set_id, workout_id, workout_started_at, plan_id, plan_name, exercise_id, exercise_name, set_number, reps, weight_kg, rpe, notes, performed_at, set_duration_sec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(set.setId || `legacy-${index}-${String(set.timestamp || '')}`, set.workoutId || 'legacy', null, null, set.planName || '', null, set.exerciseName || '', Number(set.setNumber || 0), Number(set.reps || 0), String(set.weightKg ?? 0), Number(set.rpe || 0), set.notes || '', set.timestamp || new Date().toISOString(), 0));
  for (let index = 0; index < statements.length; index += 75) await env.DB.batch(statements.slice(index, index + 75));
}

export async function GET(request: Request) {
  await ensureTables();
  const view = new URL(request.url).searchParams.get('view');
  if (view === 'sets') {
    let result = await env.DB.prepare('SELECT plan_name AS planName, exercise_name AS exerciseName, CAST(reps AS TEXT) AS reps, weight_kg AS weightKg, CAST(rpe AS TEXT) AS rpe, performed_at AS timestamp FROM training_sets ORDER BY performed_at DESC LIMIT 1000').all();
    if (!result.results.length) { await importLegacySets(); result = await env.DB.prepare('SELECT plan_name AS planName, exercise_name AS exerciseName, CAST(reps AS TEXT) AS reps, weight_kg AS weightKg, CAST(rpe AS TEXT) AS rpe, performed_at AS timestamp FROM training_sets ORDER BY performed_at DESC LIMIT 1000').all(); }
    return Response.json({ ok: true, sets: result.results });
  }
  const row = await env.DB.prepare('SELECT plans_json, week_plan_json, matches_json, exercise_bank_json, updated_at FROM app_state WHERE owner_key = ?').bind(ownerKey).first<Record<string, unknown>>();
  if (!row) return Response.json({ ok: true, state: null });
  return Response.json({ ok: true, state: { plans: parseJson(row.plans_json), weekPlan: parseJson(row.week_plan_json), matches: parseJson(row.matches_json), exerciseBank: parseJson(row.exercise_bank_json), updatedAt: row.updated_at } });
}

export async function PATCH(request: Request) {
  await ensureTables();
  const body = await request.json() as Record<string, unknown>;
  const entries = Object.entries(stateFields).filter(([key]) => Object.prototype.hasOwnProperty.call(body, key));
  if (!entries.length) return Response.json({ ok: false, error: 'no_supported_fields' }, { status: 400 });
  const now = new Date().toISOString();
  await env.DB.prepare('INSERT OR IGNORE INTO app_state (owner_key, updated_at) VALUES (?, ?)').bind(ownerKey, now).run();
  for (const [key, column] of entries) await env.DB.prepare(`UPDATE app_state SET ${column} = ?, updated_at = ? WHERE owner_key = ?`).bind(JSON.stringify(body[key]), now, ownerKey).run();
  return Response.json({ ok: true, updatedAt: now });
}

export async function POST(request: Request) {
  await ensureTables();
  const body = await request.json() as { action?: string; set?: Record<string, unknown> };
  if (body.action !== 'saveSet' || !body.set?.setId || !body.set?.workoutId) return Response.json({ ok: false, error: 'invalid_action' }, { status: 400 });
  const set = body.set;
  await env.DB.prepare('INSERT OR REPLACE INTO training_sets (set_id, workout_id, workout_started_at, plan_id, plan_name, exercise_id, exercise_name, set_number, reps, weight_kg, rpe, notes, performed_at, set_duration_sec) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(set.setId, set.workoutId, set.workoutStartedAt || null, set.planId || null, set.planName || '', set.exerciseId || null, set.exerciseName || '', set.setNumber || 0, set.reps || 0, String(set.weightKg ?? 0), set.rpe || null, set.notes || '', set.performedAt || new Date().toISOString(), set.setDurationSec || 0).run();
  return Response.json({ ok: true });
}
