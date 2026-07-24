import { distanceKm } from '@/lib/weatherUtils';

/** A normalised surface wind observation from an airport METAR, in km/h. */
export interface MetarObservation {
  stationId: string;
  stationName: string;
  lat: number;
  lon: number;
  distanceKm: number;
  /** Sustained wind, km/h. */
  windSpeed: number;
  /** Gust, km/h — absent when the report carries no gust group. */
  windGusts?: number;
  /** Degrees, or undefined when the report says VRB (variable). */
  windDirection?: number;
  /** ISO timestamp of the observation. */
  observedAt: string;
}

interface MetarApiEntry {
  icaoId?: string;
  name?: string;
  lat?: number;
  lon?: number;
  // METAR wind is in KNOTS — confirmed against the raw report ("29010KT" comes
  // back as wspd: 10). Converting as if it were km/h or m/s would understate
  // the wind by ~1.9x or overstate it by ~3.6x respectively.
  wspd?: number | null;
  wgst?: number | null;
  // Can be the string "VRB" for variable wind, not just a number.
  wdir?: number | string | null;
  /** Epoch seconds, UTC. */
  obsTime?: number;
}

const KNOTS_TO_KMH = 1.852;

/** Airport reporting sites are sparse, so the search box is generous — the real
 *  distance filter is applied by the caller against the returned distanceKm. */
const SEARCH_RADIUS_DEG = 0.8;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  return value;
};

/**
 * Nearest airport METAR with a usable wind reading, or null.
 *
 * Unlike AEMET this is global, so it is the fallback that gives the wind
 * widget a real measurement to show outside Spain.
 */
export const fetchNearestMetar = async (lat: number, lon: number): Promise<MetarObservation | null> => {
  // Longitude degrees shrink towards the poles; widening the box by 1/cos(lat)
  // keeps the search area roughly circular instead of a thin sliver up north.
  const latPadding = SEARCH_RADIUS_DEG;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lonPadding = Math.min(20, SEARCH_RADIUS_DEG / Math.max(0.1, Math.abs(cosLat)));

  const bbox = [lat - latPadding, lon - lonPadding, lat + latPadding, lon + lonPadding]
    .map((v) => v.toFixed(4))
    .join(',');

  try {
    const res = await fetch(`/api/metar?bbox=${encodeURIComponent(bbox)}`);
    if (!res.ok) return null;

    const data: MetarApiEntry[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    let best: MetarObservation | null = null;

    for (const entry of data) {
      const stationLat = toNumber(entry.lat);
      const stationLon = toNumber(entry.lon);
      const windKnots = toNumber(entry.wspd);
      const obsTime = toNumber(entry.obsTime);

      // A station with no wind field or no position tells us nothing here.
      if (stationLat === undefined || stationLon === undefined) continue;
      if (windKnots === undefined || obsTime === undefined) continue;

      const d = distanceKm(lat, lon, stationLat, stationLon);
      if (best && d >= best.distanceKm) continue;

      const gustKnots = toNumber(entry.wgst);
      // "VRB" (variable) is a valid direction value and must not become NaN.
      const direction = toNumber(entry.wdir);

      best = {
        stationId: entry.icaoId ?? '',
        stationName: entry.name ?? entry.icaoId ?? '',
        lat: stationLat,
        lon: stationLon,
        distanceKm: d,
        windSpeed: windKnots * KNOTS_TO_KMH,
        windGusts: gustKnots !== undefined ? gustKnots * KNOTS_TO_KMH : undefined,
        windDirection: direction,
        observedAt: new Date(obsTime * 1000).toISOString(),
      };
    }

    return best;
  } catch (err) {
    console.error('METAR fetch error:', err);
    return null;
  }
};
