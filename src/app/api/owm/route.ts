import { NextRequest, NextResponse } from 'next/server';

// OpenWeatherMap 2.5 — free tier: 1.000 calls/day, no credit card required
// Used primarily as a second model source (GFS-based) to compare against Open-Meteo (ECMWF).
// Docs: https://openweathermap.org/api

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';

const REVALIDATE: Record<string, number> = {
  weather: 600,          // current — 10 min
  forecast: 3600,        // 5-day/3h — 1 h
  air_pollution: 3600,   // AQI — 1 h
  air_pollution_forecast: 3600,
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') ?? 'weather'; // weather | forecast | air_pollution | air_pollution_forecast
  const lang = searchParams.get('lang') ?? 'es';
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenWeatherMap API key not configured on server.' }, { status: 503 });
  }

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const validTypes = Object.keys(REVALIDATE);
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 });
  }

  const url = new URL(`${OWM_BASE}/${type}`);
  url.searchParams.set('lat', lat);
  url.searchParams.set('lon', lon);
  url.searchParams.set('appid', apiKey);
  url.searchParams.set('units', 'metric');
  // lang only applies to descriptive text endpoints, not air_pollution
  if (!type.startsWith('air_pollution')) url.searchParams.set('lang', lang);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE[type] } });
    if (!res.ok) {
      return NextResponse.json({ error: 'OpenWeatherMap API error', status: res.status }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Failed to reach OpenWeatherMap API' }, { status: 502 });
  }
}
