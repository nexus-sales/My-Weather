import { NextRequest, NextResponse } from 'next/server';

// UK Met Office via Open-Meteo: `ukmo_seamless` blends the global UKMO model
// (~10 km) with the higher-resolution UKV (~2 km, United Kingdom and Ireland)
// — Open-Meteo picks the right resolution automatically, so unlike DWD there
// are no regional sub-models to choose between and no fallback chain needed.
// Docs: https://open-meteo.com/en/docs/ukmo-api

const BASE = 'https://api.open-meteo.com/v1/forecast';

// lifted_index deliberately excluded: verified live that Open-Meteo returns
// it as an always-null placeholder for ukmo_seamless (unit "undefined") —
// UKV/UKMO doesn't actually provide it, unlike DWD ICON. cape does have
// real values, so that one stays.
const HOURLY_VARS = [
  'temperature_2m', 'precipitation', 'wind_speed_10m',
  'wind_direction_10m', 'wind_gusts_10m', 'weather_code',
  'cape',
].join(',');

const CURRENT_VARS = [
  'temperature_2m', 'precipitation', 'wind_speed_10m', 'weather_code',
].join(',');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const url = new URL(BASE);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('models', 'ukmo_seamless');
  url.searchParams.set('current', CURRENT_VARS);
  url.searchParams.set('hourly', HOURLY_VARS);
  url.searchParams.set('forecast_days', '5');
  url.searchParams.set('timezone', 'auto');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'UKMO API error', status: res.status }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json({ ...data, model: 'ukmo_seamless' });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch UKMO data' }, { status: 502 });
  }
}
