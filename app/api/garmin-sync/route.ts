import { env } from 'cloudflare:workers';

type GarminActivity = { activityId: string; startTime: string; activityType: string; name: string; durationMin: number; distanceKm: number; calories: number; avgHr: number; maxHr: number; aerobicEffect: number; anaerobicEffect: number; trainingLoad: number; sourceDevice: string };
type GarminHealth = { date: string; sleepScore: number; sleepHours: number; hrvStatus: string; hrvLastNightMs: number; restingHr: number; bodyBatteryHigh: number; bodyBatteryLow: number; stressAvg: number; steps: number; calories: number; intensityMinutes: number; readinessScore: number };

async function ensureTables() {
  await env.DB.batch([
    env.DB.prepare('CREATE TABLE IF NOT EXISTS garmin_activities (activity_id TEXT PRIMARY KEY, started_at TEXT NOT NULL, activity_type TEXT NOT NULL, raw_json TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_garmin_activities_started_at ON garmin_activities (started_at)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS garmin_health (health_date TEXT PRIMARY KEY, raw_json TEXT NOT NULL, updated_at TEXT NOT NULL)'),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_garmin_health_date ON garmin_health (health_date)'),
  ]);
}

const activityRow = (item: GarminActivity) => [item.activityId, item.startTime, item.activityType, item.name, item.durationMin, item.distanceKm, item.calories, item.avgHr, item.maxHr, item.aerobicEffect, item.anaerobicEffect, item.trainingLoad, item.sourceDevice];
const healthRow = (item: GarminHealth) => [item.date, item.sleepScore, item.sleepHours, item.hrvStatus, item.hrvLastNightMs, item.restingHr, item.bodyBatteryHigh, item.bodyBatteryLow, item.stressAvg, item.steps, item.calories, item.intensityMinutes, item.readinessScore];

async function readCache() {
  await ensureTables();
  const [activities, health] = await Promise.all([
    env.DB.prepare('SELECT raw_json FROM garmin_activities ORDER BY started_at DESC').all<{ raw_json: string }>(),
    env.DB.prepare('SELECT raw_json FROM garmin_health ORDER BY health_date DESC LIMIT 365').all<{ raw_json: string }>(),
  ]);
  const activityData = activities.results.map((row) => JSON.parse(row.raw_json) as GarminActivity);
  const healthData = health.results.map((row) => JSON.parse(row.raw_json) as GarminHealth);
  return { activities: activityData.map(activityRow), health: healthData.map(healthRow), latestHealth: healthData.length ? healthRow(healthData[0]) : null };
}

async function storeData(activities: GarminActivity[], health: GarminHealth[]) {
  await ensureTables();
  const now = new Date().toISOString();
  const statements = [
    ...activities.filter((item) => item.activityId).map((item) => env.DB.prepare('INSERT OR REPLACE INTO garmin_activities (activity_id, started_at, activity_type, raw_json, updated_at) VALUES (?, ?, ?, ?, ?)').bind(item.activityId, item.startTime, item.activityType, JSON.stringify(item), now)),
    ...health.filter((item) => item.date).map((item) => env.DB.prepare('INSERT OR REPLACE INTO garmin_health (health_date, raw_json, updated_at) VALUES (?, ?, ?)').bind(item.date, JSON.stringify(item), now)),
  ];
  for (let index = 0; index < statements.length; index += 75) await env.DB.batch(statements.slice(index, index + 75));
}

async function importLegacyGarmin() {
  if (!env.GOOGLE_SHEETS_ENDPOINT || !env.GOOGLE_SHEETS_SECRET) return;
  const response = await fetch(env.GOOGLE_SHEETS_ENDPOINT, { method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'getGarminDashboard', secret: env.GOOGLE_SHEETS_SECRET }) });
  const data = await response.json() as { ok?: boolean; activities?: unknown[][]; health?: unknown[][] };
  if (!data.ok) return;
  const activities = (data.activities || []).map((row) => ({ activityId: String(row[0] || ''), startTime: String(row[1] || ''), activityType: String(row[2] || ''), name: String(row[3] || 'Garmin activity'), durationMin: Number(row[4] || 0), distanceKm: Number(row[5] || 0), calories: Number(row[6] || 0), avgHr: Number(row[7] || 0), maxHr: Number(row[8] || 0), aerobicEffect: Number(row[9] || 0), anaerobicEffect: Number(row[10] || 0), trainingLoad: Number(row[11] || 0), sourceDevice: String(row[12] || 'Garmin') }));
  const health = (data.health || []).map((row) => ({ date: String(row[0] || ''), sleepScore: Number(row[1] || 0), sleepHours: Number(row[2] || 0), hrvStatus: String(row[3] || ''), hrvLastNightMs: Number(row[4] || 0), restingHr: Number(row[5] || 0), bodyBatteryHigh: Number(row[6] || 0), bodyBatteryLow: Number(row[7] || 0), stressAvg: Number(row[8] || 0), steps: Number(row[9] || 0), calories: Number(row[10] || 0), intensityMinutes: Number(row[11] || 0), readinessScore: Number(row[12] || 0) }));
  await storeData(activities, health);
}

export async function GET() {
  let cache = await readCache();
  if (!cache.activities.length) { await importLegacyGarmin(); cache = await readCache(); }
  return Response.json({ ok: true, ...cache });
}

export async function POST(request: Request) {
  if (!env.GARMIN_SYNC_URL || !env.GARMIN_SYNC_API_KEY) return Response.json({ ok: false, error: 'garmin_sync_not_configured' }, { status: 503 });
  await ensureTables();
  const existing = await env.DB.prepare('SELECT COUNT(*) AS count FROM garmin_activities').first<{ count: number }>();
  const full = new URL(request.url).searchParams.get('full') === '1' || Number(existing?.count || 0) === 0;
  try {
    const response = await fetch(`${env.GARMIN_SYNC_URL.replace(/\/$/, '')}/sync?full=${full ? 'true' : 'false'}`, { method: 'POST', headers: { authorization: `Bearer ${env.GARMIN_SYNC_API_KEY}` } });
    const text = await response.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text) as Record<string, unknown>; } catch { data = { detail: text.slice(0, 300) }; }
    if (!response.ok || !data.ok) return Response.json({ ok: false, error: String(data.detail || data.error || 'garmin_sync_failed'), upstreamStatus: response.status }, { status: 502 });
    const activities = (data.activityData || []) as GarminActivity[];
    const health = (data.healthData || []) as GarminHealth[];
    await storeData(activities, health);
    const cache = await readCache();
    return Response.json({ ok: true, importedActivities: activities.length, importedHealthDays: health.length, totalActivities: cache.activities.length, syncedThrough: data.syncedThrough, ...cache });
  } catch (error) {
    return Response.json({ ok: false, error: error instanceof Error ? error.message : 'garmin_sync_unavailable' }, { status: 502 });
  }
}
