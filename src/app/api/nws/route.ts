import { NextRequest, NextResponse } from 'next/server';

// NOAA National Weather Service — covers US territory only (including Puerto Rico, Guam).
// Returns { covered: false } for non-US coordinates so the client can handle gracefully.

const NWS_BASE = 'https://api.weather.gov';
const USER_AGENT = 'Solajero/5.0 (admin@nexus-sales.eu)';

const NWS_HEADERS = {
  'User-Agent': USER_AGENT,
  'Accept': 'application/geo+json',
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const type = searchParams.get('type') ?? 'forecast'; // forecast | hourly | alerts

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    // NWS requires a two-step lookup: coordinates → grid point → data
    const pointsRes = await fetch(`${NWS_BASE}/points/${lat},${lon}`, {
      headers: NWS_HEADERS,
      next: { revalidate: 86400 }, // Grid points are stable
    });

    if (!pointsRes.ok) {
      // 404 or 301 means the location is outside US coverage
      return NextResponse.json({ covered: false, error: 'Location not covered by NOAA NWS (US territory only)' }, { status: 200 });
    }

    const points = await pointsRes.json();

    // Alerts don't need a grid — fetch by coordinate directly
    if (type === 'alerts') {
      const alertsRes = await fetch(
        `${NWS_BASE}/alerts/active?point=${lat},${lon}`,
        { headers: NWS_HEADERS, next: { revalidate: 900 } }
      );
      if (!alertsRes.ok) {
        return NextResponse.json({ error: 'NWS alerts error', status: alertsRes.status }, { status: alertsRes.status });
      }
      return NextResponse.json({ covered: true, ...(await alertsRes.json()) });
    }

    const { gridId, gridX, gridY } = points.properties;
    const forecastPath = type === 'hourly' ? 'forecast/hourly' : 'forecast';

    const forecastRes = await fetch(
      `${NWS_BASE}/gridpoints/${gridId}/${gridX},${gridY}/${forecastPath}`,
      { headers: NWS_HEADERS, next: { revalidate: 3600 } }
    );

    if (!forecastRes.ok) {
      return NextResponse.json({ error: 'NWS forecast error', status: forecastRes.status }, { status: forecastRes.status });
    }

    return NextResponse.json({ covered: true, ...(await forecastRes.json()) });
  } catch {
    return NextResponse.json({ error: 'Failed to reach NOAA NWS API' }, { status: 502 });
  }
}
