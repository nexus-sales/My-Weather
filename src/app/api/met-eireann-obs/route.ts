import { NextRequest, NextResponse } from 'next/server';

// Met Éireann's public observations feed — the one behind met.ie's own
// "latest reports" tables. Real station measurements, unlike the forecast
// endpoint in /api/met-eireann which serves a HARMONIE point forecast.
const BASE = 'https://prodapi.metweb.ie/observations';

export async function GET(request: NextRequest) {
  const station = request.nextUrl.searchParams.get('station');

  if (!station) {
    return NextResponse.json({ error: 'station is required' }, { status: 400 });
  }

  // Slugs are plain lowercase names. Constraining the shape keeps arbitrary
  // path segments from being appended to the upstream URL.
  if (!/^[a-z]{2,40}$/.test(station)) {
    return NextResponse.json({ error: 'invalid station' }, { status: 400 });
  }

  try {
    const res = await fetch(`${BASE}/${station}/today`, {
      headers: { 'User-Agent': 'Solajero/1.0 (weather app)' },
      // Stations report hourly.
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Met Eireann observations error', status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'cache-control': 'public, s-maxage=600, stale-while-revalidate=1200' },
    });
  } catch (err) {
    console.error('Met Eireann observations proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch Met Eireann observations' }, { status: 502 });
  }
}
