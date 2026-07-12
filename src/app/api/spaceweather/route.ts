import { NextRequest, NextResponse } from 'next/server';

// NOAA SWPC — free, public, no API key. Same proxy pattern as /api/meteoalarm
// and /api/rainviewer: fetch server-side, reshape, cache briefly.
const KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const FLARE_URL = 'https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json';
const OVATION_URL = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json';

type KpEntry = { time_tag: string; Kp: number };
type FlareEntry = { time_tag: string; max_class?: string; current_class?: string };
type OvationResponse = { 'Forecast Time'?: string; coordinates?: [number, number, number][] };

async function fetchKp(): Promise<{ kp: number; time: string } | null> {
  const res = await fetch(KP_URL, { next: { revalidate: 900 } });
  if (!res.ok) return null;
  const data = (await res.json()) as KpEntry[];
  if (!Array.isArray(data) || data.length === 0) return null;
  const latest = data[data.length - 1];
  return { kp: latest.Kp, time: latest.time_tag };
}

async function fetchFlareClass(): Promise<{ flareClass: string; time: string } | null> {
  const res = await fetch(FLARE_URL, { next: { revalidate: 900 } });
  if (!res.ok) return null;
  const data = (await res.json()) as FlareEntry[];
  if (!Array.isArray(data) || data.length === 0) return null;
  const latest = data[data.length - 1];
  const rawClass = latest.max_class ?? latest.current_class ?? '';
  // "C1.0" -> "C" — the letter is the class, the number is intensity within it.
  const flareClass = rawClass.charAt(0) || 'A';
  return { flareClass, time: latest.time_tag };
}

/** Nearest-point lookup on OVATION's 1-degree aurora probability grid (0-100). */
async function fetchAuroraProbability(lat: number, lon: number): Promise<{ probability: number; time: string } | null> {
  const res = await fetch(OVATION_URL, { next: { revalidate: 1800 } });
  if (!res.ok) return null;
  const data = (await res.json()) as OvationResponse;
  if (!Array.isArray(data.coordinates)) return null;

  const targetLon = ((lon % 360) + 360) % 360; // NOAA uses 0-360, app uses -180..180
  const targetLat = lat;

  let best: number | null = null;
  let bestDist = Infinity;
  for (const [gLon, gLat, aurora] of data.coordinates) {
    const dLon = Math.min(Math.abs(gLon - targetLon), 360 - Math.abs(gLon - targetLon));
    const dLat = Math.abs(gLat - targetLat);
    const dist = dLon + dLat;
    if (dist < bestDist) {
      bestDist = dist;
      best = aurora;
      if (dist === 0) break;
    }
  }

  return best === null ? null : { probability: best, time: data['Forecast Time'] ?? '' };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const lat = parseFloat(searchParams.get('lat') ?? '');
  const lon = parseFloat(searchParams.get('lon') ?? '');
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  try {
    const [kpResult, flareResult, auroraResult] = await Promise.allSettled([
      fetchKp(),
      fetchFlareClass(),
      hasCoords ? fetchAuroraProbability(lat, lon) : Promise.resolve(null),
    ]);

    const kpData = kpResult.status === 'fulfilled' ? kpResult.value : null;
    const flareData = flareResult.status === 'fulfilled' ? flareResult.value : null;
    const auroraData = auroraResult.status === 'fulfilled' ? auroraResult.value : null;

    if (!kpData && !flareData && !auroraData) {
      return NextResponse.json({ error: 'NOAA space weather data unavailable' }, { status: 502 });
    }

    return NextResponse.json({
      kpIndex: kpData?.kp ?? null,
      kpTime: kpData?.time ?? null,
      flareClass: flareData?.flareClass ?? null,
      flareTime: flareData?.time ?? null,
      auroraProbability: auroraData?.probability ?? null,
      auroraTime: auroraData?.time ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to reach NOAA SWPC' }, { status: 502 });
  }
}
