import { NextRequest, NextResponse } from 'next/server';

// Lightning / Convective Activity Route Handler
//
// Layer 1 — Open-Meteo convective indices (free, no key, active now):
//   CAPE (J/kg)       > 500 = moderate risk, > 1500 = high, > 3000 = extreme
//   Lifted Index (K)  < 0   = unstable,       < -4  = very unstable
//   CIN  (J/kg)       tells whether convection can break the cap
//   Weather codes 95–99 = active thunderstorms
//
// Layer 2 — Blitzortung (real-time strike locations):
//   Requires BLITZORTUNG_TOKEN env var (register at blitzortung.org as data user).
//   Without a token this layer is skipped silently and `strikes` is null.

const OPENMETEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const BLITZORTUNG_BASE = 'https://data.blitzortung.org/Data_1/Protected';

const CONVECTIVE_HOURLY = [
  'cape', 'lifted_index', 'convective_inhibition',
  'precipitation', 'precipitation_probability',
  'weather_code', 'wind_speed_10m', 'wind_gusts_10m',
].join(',');

function classifyRisk(cape: number, li: number): 'none' | 'low' | 'moderate' | 'high' | 'extreme' {
  if (cape < 100 && li > 2) return 'none';
  if (cape < 500 || li > 0) return 'low';
  if (cape < 1500 && li > -4) return 'moderate';
  if (cape < 3000 || li > -6) return 'high';
  return 'extreme';
}

async function fetchConvectiveData(lat: string, lon: string) {
  const url = new URL(OPENMETEO_BASE);
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('hourly', CONVECTIVE_HOURLY);
  url.searchParams.set('current', 'cape,weather_code,wind_gusts_10m');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '3');

  const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error('Open-Meteo convective fetch failed');
  const data = await res.json();

  const currentCape: number = data.current?.cape ?? 0;
  const currentLi: number = data.hourly?.lifted_index?.[0] ?? 10;
  const currentCode: number = data.current?.weather_code ?? 0;
  const isThunderstorm = currentCode >= 95 && currentCode <= 99;

  return {
    current: {
      cape: currentCape,
      liftedIndex: currentLi,
      weatherCode: currentCode,
      isThunderstorm,
      risk: classifyRisk(currentCape, currentLi),
      gusts: data.current?.wind_gusts_10m ?? null,
    },
    hourly: {
      time: data.hourly.time,
      cape: data.hourly.cape,
      liftedIndex: data.hourly.lifted_index,
      cin: data.hourly.convective_inhibition,
      precipitation: data.hourly.precipitation,
      precipitationProbability: data.hourly.precipitation_probability,
      weatherCode: data.hourly.weather_code,
      windGusts: data.hourly.wind_gusts_10m,
    },
  };
}

async function fetchBlitzortungStrikes(lat: string, lon: string): Promise<unknown | null> {
  const token = process.env.BLITZORTUNG_TOKEN;
  if (!token) return null;

  // Blitzortung serves 10-minute strike archives by region
  // Region bounding box: snap coordinates to nearest 10-degree grid
  const latBucket = Math.floor(parseFloat(lat) / 10) * 10;
  const lonBucket = Math.floor(parseFloat(lon) / 10) * 10;
  const now = new Date();
  // Round down to nearest 10-minute window
  const minutes = Math.floor(now.getUTCMinutes() / 10) * 10;
  const timestamp = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${String(now.getUTCDate()).padStart(2, '0')}/${String(now.getUTCHours()).padStart(2, '0')}/${String(minutes).padStart(2, '0')}`;

  try {
    const res = await fetch(
      `${BLITZORTUNG_BASE}/${timestamp}_${latBucket}_${lonBucket}.json`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  try {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    // Validate range and type
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    const [convective, strikes] = await Promise.allSettled([
      fetchConvectiveData(lat, lon),
      fetchBlitzortungStrikes(lat, lon),
    ]);

    if (convective.status === 'rejected') {
      return NextResponse.json({ error: 'Failed to fetch convective data' }, { status: 502 });
    }

    return NextResponse.json({
      convective: convective.value,
      // Ensure strikes data is just the data array if it's a known format, otherwise keep as is but safely
      strikes: strikes.status === 'fulfilled' ? strikes.value : null,
      blitzortungActive: !!process.env.BLITZORTUNG_TOKEN,
    });
  } catch {
    // Audit-safe error logging (don't log the full error object which might contain request info)
    console.error('Lightning API: Fetch error');
    return NextResponse.json({ error: 'Lightning API error' }, { status: 502 });
  }
}
