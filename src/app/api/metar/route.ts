import { NextRequest, NextResponse } from 'next/server';

// NOAA / Aviation Weather Center. Free, global, no API key — the only ground
// observation network available outside AEMET's Spain-only coverage.
const BASE = 'https://aviationweather.gov/api/data/metar';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const bbox = searchParams.get('bbox');

  if (!bbox) {
    return NextResponse.json({ error: 'bbox is required' }, { status: 400 });
  }

  // bbox arrives as "minLat,minLon,maxLat,maxLon" — reject anything else
  // rather than forwarding arbitrary text to the upstream service.
  const parts = bbox.split(',');
  if (parts.length !== 4 || parts.some((p) => !Number.isFinite(Number.parseFloat(p)))) {
    return NextResponse.json({ error: 'bbox must be minLat,minLon,maxLat,maxLon' }, { status: 400 });
  }

  const url = `${BASE}?bbox=${encodeURIComponent(bbox)}&format=json`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Solajero/1.0 (weather app)' },
      // Routine METARs are issued hourly, SPECIs in between — 5 min keeps the
      // reading current without hammering a free public service.
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'METAR API error', status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (err) {
    console.error('METAR proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch METAR data' }, { status: 502 });
  }
}
