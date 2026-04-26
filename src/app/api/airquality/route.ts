import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

const DEFAULT_HOURLY = [
  'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide',
  'sulphur_dioxide', 'ozone', 'european_aqi', 'us_aqi',
  'dust', 'uv_index',
  'alder_pollen', 'birch_pollen', 'grass_pollen',
  'mugwort_pollen', 'olive_pollen', 'ragweed_pollen',
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
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '3');

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Air quality API error', status: res.status }, { status: res.status });
    }
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Failed to fetch air quality data' }, { status: 502 });
  }
}
