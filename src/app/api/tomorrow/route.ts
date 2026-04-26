import { NextRequest, NextResponse } from 'next/server';

// Tomorrow.io — free tier: 500 calls/day, 25 calls/hour
// Docs: https://docs.tomorrow.io/reference/welcome

const BASE = 'https://api.tomorrow.io/v4/weather';

const REALTIME_FIELDS = [
  'temperature', 'temperatureApparent', 'humidity',
  'windSpeed', 'windGust', 'windDirection',
  'precipitationIntensity', 'precipitationProbability', 'precipitationType',
  'uvIndex', 'visibility', 'cloudCover', 'pressureSurfaceLevel',
  'weatherCode', 'snowAccumulation', 'snowDepth',
  'fireIndex',
  'pollenIndexTree', 'pollenIndexGrass', 'pollenIndexWeed',
].join(',');

const FORECAST_FIELDS = [
  'temperature', 'temperatureApparent', 'temperatureMax', 'temperatureMin',
  'humidity', 'windSpeed', 'windGust', 'windDirection',
  'precipitationIntensity', 'precipitationProbability', 'precipitationType',
  'uvIndex', 'visibility', 'cloudCover', 'weatherCode',
  'sunriseTime', 'sunsetTime',
  'fireIndex',
  'pollenIndexTree', 'pollenIndexGrass', 'pollenIndexWeed',
].join(',');

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') ?? 'realtime';       // realtime | forecast
  const timesteps = searchParams.get('timesteps') ?? '1d';   // 1h | 1d (realtime ignores this)
  const apiKey = process.env.TOMORROW_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Tomorrow.io API key not configured on server.' }, { status: 503 });
  }

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  if (!['realtime', 'forecast'].includes(type)) {
    return NextResponse.json({ error: 'type must be realtime or forecast' }, { status: 400 });
  }

  const url = new URL(`${BASE}/${type}`);
  url.searchParams.set('location', `${lat},${lon}`);
  url.searchParams.set('fields', type === 'realtime' ? REALTIME_FIELDS : FORECAST_FIELDS);
  url.searchParams.set('units', 'metric');
  url.searchParams.set('apikey', apiKey);
  if (type === 'forecast') url.searchParams.set('timesteps', timesteps);

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: type === 'realtime' ? 600 : 3600 },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: 'Tomorrow.io API error', detail: err }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Failed to reach Tomorrow.io API' }, { status: 502 });
  }
}
