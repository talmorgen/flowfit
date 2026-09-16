import { env } from 'cloudflare:workers';

const allowedActions = new Set(['ping', 'getRecentWorkouts', 'getRecentSets', 'saveExercise', 'saveSet', 'getGarminDashboard']);

async function callSheets(payload: Record<string, unknown>) {
  if (!env.GOOGLE_SHEETS_ENDPOINT || !env.GOOGLE_SHEETS_SECRET) {
    return Response.json({ ok: false, error: 'sheets_not_configured' }, { status: 503 });
  }

  const response = await fetch(env.GOOGLE_SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...payload, secret: env.GOOGLE_SHEETS_SECRET }),
    redirect: 'follow',
  });

  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return Response.json(data, { status: data.ok ? 200 : data.error === 'unauthorized' ? 401 : 400 });
  } catch {
    return Response.json({ ok: false, error: 'invalid_sheets_response' }, { status: 502 });
  }
}

export async function GET(request: Request) {
  if (new URL(request.url).searchParams.get('source') === 'garmin') {
    return callSheets({ action: 'getGarminDashboard' });
  }
  const setsResponse = await callSheets({ action: 'getRecentSets', limit: 500 });
  if (setsResponse.status === 200) return setsResponse;
  return callSheets({ action: 'getRecentWorkouts', limit: 200 });
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  if (!allowedActions.has(String(body.action))) {
    return Response.json({ ok: false, error: 'invalid_action' }, { status: 400 });
  }
  return callSheets(body);
}
