import { env } from 'cloudflare:workers';

export async function POST() {
  if (!env.GARMIN_SYNC_URL || !env.GARMIN_SYNC_API_KEY) {
    return Response.json({ ok: false, error: 'garmin_sync_not_configured' }, { status: 503 });
  }
  try {
    const response = await fetch(`${env.GARMIN_SYNC_URL.replace(/\/$/, '')}/sync`, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.GARMIN_SYNC_API_KEY}` },
    });
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch {
    return Response.json({ ok: false, error: 'garmin_sync_unavailable' }, { status: 502 });
  }
}
