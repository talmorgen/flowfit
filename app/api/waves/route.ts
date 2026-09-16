export async function GET() {
  const url = new URL('https://marine-api.open-meteo.com/v1/marine');
  url.searchParams.set('latitude', '32.386');
  url.searchParams.set('longitude', '34.853');
  url.searchParams.set('daily', 'wave_height_max,wave_period_max,wave_direction_dominant');
  url.searchParams.set('timezone', 'Asia/Jerusalem');
  url.searchParams.set('forecast_days', '4');

  try {
    const response = await fetch(url, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error('forecast_failed');
    const data = await response.json();
    return Response.json(data, { headers: { 'cache-control': 'public, max-age=1800' } });
  } catch {
    return Response.json({ error: 'wave_forecast_unavailable' }, { status: 502 });
  }
}
