import { NextRequest, NextResponse } from 'next/server';

// DWD ICON models via Open-Meteo:
//   icon_d2     — Central Europe, ~1 km resolution, 48 h
//   icon_eu     — Europe, ~7 km resolution, 5 days
//   icon_global — Global, ~13 km resolution, 7 days
// icon_d2 covers only Central Europe; falls back to icon_eu for other locations.

const BASE = 'https://api.open-meteo.com/v1/forecast';

const HOURLY_VARS = [
  'temperature_2m', 'precipitation', 'wind_speed_10m',
  'wind_direction_10m', 'wind_gusts_10m', 'weather_code',
  'cape', 'lifted_index',
].join(',');

const CURRENT_VARS = [
  'temperature_2m', 'precipitation', 'wind_speed_10m', 'weather_code',
].join(',');

async function fetchIcon(lat: string, lon: string, model: string, revalidate: number) {
  const url = new URL(BASE);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('models', model);
  url.searchParams.set('current', CURRENT_VARS);
  url.searchParams.set('hourly', HOURLY_VARS);
  url.searchParams.set('forecast_days', model === 'icon_d2' ? '2' : '5');
  url.searchParams.set('timezone', 'auto');
  return fetch(url.toString(), { next: { revalidate } });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const model = searchParams.get('model') ?? 'icon_eu';

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const validModels = ['icon_d2', 'icon_eu', 'icon_global'];
  if (!validModels.includes(model)) {
    return NextResponse.json({ error: `model must be one of: ${validModels.join(', ')}` }, { status: 400 });
  }

  try {
    let res = await fetchIcon(lat, lon, model, 1800);

    if (!res.ok && model === 'icon_d2') {
      // ICON-D2 doesn't cover the location — fall back to ICON-EU
      res = await fetchIcon(lat, lon, 'icon_eu', 1800);
      if (!res.ok) {
        return NextResponse.json({ error: 'DWD API error' }, { status: res.status });
      }
      const data = await res.json();
      return NextResponse.json({ ...data, model: 'icon_eu', fallback: true });
    }

    if (!res.ok) {
      return NextResponse.json({ error: 'DWD API error', status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ ...data, model });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch DWD ICON data' }, { status: 502 });
  }
}
