import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://marine-api.open-meteo.com/v1/marine';

const DEFAULT_HOURLY = [
  'wave_height', 'wave_direction', 'wave_period',
  'wind_wave_height', 'wind_wave_direction', 'wind_wave_period',
  'swell_wave_height', 'swell_wave_direction', 'swell_wave_period',
  'sea_surface_temperature',
].join(',');

const DEFAULT_DAILY = [
  'wave_height_max', 'wave_direction_dominant', 'wave_period_max',
  'swell_wave_height_max', 'swell_wave_direction_dominant', 'swell_wave_period_max',
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
  url.searchParams.set('hourly', searchParams.get('hourly') ?? DEFAULT_HOURLY);
  url.searchParams.set('daily', searchParams.get('daily') ?? DEFAULT_DAILY);
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Marine API error', status: res.status }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Failed to fetch marine data' }, { status: 502 });
  }
}
