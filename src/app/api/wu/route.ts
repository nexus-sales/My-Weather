import { NextRequest, NextResponse } from 'next/server';

const WU_BASE = 'https://api.weather.com/v2/pws';

const ALLOWED_PARAMS = ['geocode', 'limit', 'stationId', 'numericPrecision'];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const endpoint = searchParams.get('endpoint') ?? 'observations/nearby';
  const apiKey = process.env.WEATHER_UNDERGROUND_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Weather Underground API key not configured on server.' },
      { status: 503 }
    );
  }

  const forwardedParams = new URLSearchParams({ format: 'json', units: 'm', apiKey });
  ALLOWED_PARAMS.forEach((key) => {
    const val = searchParams.get(key);
    if (val) forwardedParams.set(key, val);
  });

  try {
    const res = await fetch(`${WU_BASE}/${endpoint}?${forwardedParams}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Weather Underground API error', status: res.status },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to reach Weather Underground API' }, { status: 502 });
  }
}
