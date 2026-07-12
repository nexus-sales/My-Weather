import { NextRequest, NextResponse } from 'next/server';

// Plain HTTP is intentional, not an oversight: port 443 on this host doesn't
// accept connections at all (verified — TLS handshake times out), only 80
// responds. Revisit if Met Éireann ever adds HTTPS to this legacy endpoint.
const BASE = 'http://openaccess.pf.api.met.ie/metno-wdb2ts/locationforecast';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const url = `${BASE}?lat=${encodeURIComponent(lat)};long=${encodeURIComponent(lon)}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MyWeather/1.0 (Engineering-grade weather app)',
      },
      next: { revalidate: 1800 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Met Eireann API error', status: res.status }, { status: res.status });
    }

    const xml = await res.text();
    return new NextResponse(xml, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, s-maxage=1800, stale-while-revalidate=1800',
      },
    });
  } catch (err) {
    console.error('Met Eireann Proxy error:', err);
    return NextResponse.json({ error: 'Failed to fetch Met Eireann data' }, { status: 502 });
  }
}
