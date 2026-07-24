import { distanceKm } from '@/lib/weatherUtils';

/** A surface observation measured at a Met Éireann synoptic station. */
export interface MetEireannObservation {
  slug: string;
  stationName: string;
  lat: number;
  lon: number;
  distanceKm: number;
  /** True when the position is a gazetteer lookup rather than the surveyed site. */
  positionIsApproximate: boolean;
  /** Sustained wind, km/h — Met Éireann publishes this already in km/h. */
  windSpeed?: number;
  windGusts?: number;
  windDirection?: number;
  cardinalDirection?: string;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  pressure?: number;
  /** ISO instant of the observation. */
  observedAt: string;
}

/**
 * Met Éireann synoptic stations, verified one by one against the live API.
 *
 * Two hazards drove how this table is built:
 *
 * 1. The API does NOT 404 on an unknown station — it silently returns Dublin
 *    Airport's data. Every slug here was confirmed to echo back its own name,
 *    and `fetchMetEireannObservations` re-checks that at runtime, so a station
 *    that is renamed upstream disappears instead of quietly reporting Dublin's
 *    weather under another name.
 * 2. The API publishes no coordinates. Airport sites use the exact surveyed
 *    position from their METAR record; the rest are gazetteer lookups of the
 *    place name, which is why `positionIsApproximate` exists and the UI shows
 *    "~" on those distances. Geocoding is not safe to apply blindly here:
 *    "Knock" resolves to the village, ~15 km from the Knock Airport station.
 */
const STATIONS: { slug: string; lat: number; lon: number; approximate: boolean }[] = [
  // Exact — surveyed aerodrome positions taken from their METAR records.
  { slug: 'dublinairport', lat: 53.4220, lon: -6.2980, approximate: false }, // EIDW
  { slug: 'shannon', lat: 52.7020, lon: -8.9250, approximate: false },       // EINN
  { slug: 'cork', lat: 51.8480, lon: -8.4790, approximate: false },          // EICK
  { slug: 'knock', lat: 53.9130, lon: -8.8110, approximate: false },         // EIKN
  { slug: 'casement', lat: 53.3060, lon: -6.4420, approximate: false },      // EIME
  // Approximate — place-name lookups, accurate to roughly the settlement.
  { slug: 'athenry', lat: 53.2964, lon: -8.7431, approximate: true },
  { slug: 'ballyhaise', lat: 54.0500, lon: -7.3167, approximate: true },
  { slug: 'belmullet', lat: 54.2250, lon: -9.9908, approximate: true },
  { slug: 'claremorris', lat: 53.7167, lon: -9.0000, approximate: true },
  { slug: 'dunsany', lat: 53.5399, lon: -6.6193, approximate: true },
  { slug: 'finner', lat: 54.4778, lon: -8.2809, approximate: true },
  { slug: 'gurteen', lat: 54.3258, lon: -8.3139, approximate: true },
  { slug: 'mullingar', lat: 53.5247, lon: -7.3385, approximate: true },
  { slug: 'valentia', lat: 51.9083, lon: -10.3719, approximate: true },
];

interface MetEireannObsEntry {
  name?: string;
  temperature?: string;
  windSpeed?: string;
  windGust?: string;
  cardinalWindDirection?: string;
  windDirection?: number;
  humidity?: string;
  rainfall?: string;
  pressure?: string;
  /** "DD-MM-YYYY", Irish local date. */
  date?: string;
  /** "HH:MM", Irish local time — no offset anywhere in the payload. */
  reportTime?: string;
}

/** Values arrive as padded strings and use "-" for "not reported". */
const parseValue = (raw: string | undefined): number | undefined => {
  if (typeof raw !== 'string') return undefined;
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '-') return undefined;
  const value = Number.parseFloat(trimmed);
  return Number.isFinite(value) ? value : undefined;
};

/**
 * Convert an Irish local wall-clock time to a real instant.
 *
 * The payload carries no offset, and Ireland switches between IST and GMT, so
 * assuming a fixed +1 would be an hour out for half the year. This asks the
 * runtime what the candidate instant looks like in Dublin and corrects by the
 * difference, which lands on the right offset for that specific date.
 */
const dublinLocalToUtc = (date: string, time: string): string | undefined => {
  const dateMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(date.trim());
  const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!dateMatch || !timeMatch) return undefined;

  const [, dd, mm, yyyy] = dateMatch;
  const [, hh, min] = timeMatch;
  const naive = Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(hh), Number(min));
  if (!Number.isFinite(naive)) return undefined;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Dublin',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const parts = formatter.formatToParts(new Date(naive));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asDublin = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'));
  if (!Number.isFinite(asDublin)) return undefined;

  return new Date(naive - (asDublin - naive)).toISOString();
};

const fetchStation = async (
  station: (typeof STATIONS)[number],
  lat: number,
  lon: number,
): Promise<MetEireannObservation | null> => {
  const res = await fetch(`/api/met-eireann-obs?station=${encodeURIComponent(station.slug)}`);
  if (!res.ok) return null;

  const data: MetEireannObsEntry[] = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const latest = data[data.length - 1];
  const name = latest.name?.trim();
  if (!name) return null;

  // Guard against the silent Dublin Airport fallback: only Dublin's own slug
  // may legitimately report that name.
  if (name === 'Dublin Airport' && station.slug !== 'dublinairport') return null;

  const observedAt = dublinLocalToUtc(latest.date ?? '', latest.reportTime ?? '');
  if (!observedAt) return null;

  return {
    slug: station.slug,
    stationName: name,
    lat: station.lat,
    lon: station.lon,
    distanceKm: distanceKm(lat, lon, station.lat, station.lon),
    positionIsApproximate: station.approximate,
    // Met Éireann publishes wind in km/h — confirmed by comparing its Dublin
    // Airport reading against co-located METAR EIDW (26 against 12 kt, i.e.
    // 22.2 km/h, with matching temperature and direction; knots is ruled out).
    windSpeed: parseValue(latest.windSpeed),
    windGusts: parseValue(latest.windGust),
    windDirection: typeof latest.windDirection === 'number' ? latest.windDirection : undefined,
    cardinalDirection: latest.cardinalWindDirection?.trim() || undefined,
    temperature: parseValue(latest.temperature),
    humidity: parseValue(latest.humidity),
    rainfall: parseValue(latest.rainfall),
    pressure: parseValue(latest.pressure),
    observedAt,
  };
};

/**
 * Observations from the Met Éireann stations nearest the point, nearest first.
 *
 * Only the closest few stations are queried — the API is one request per
 * station, so fetching all of them for a list that shows a handful would be
 * wasteful.
 */
export const fetchNearbyMetEireannObs = async (
  lat: number,
  lon: number,
  limit = 5,
): Promise<MetEireannObservation[]> => {
  const candidates = [...STATIONS]
    .map((station) => ({ station, d: distanceKm(lat, lon, station.lat, station.lon) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((entry) => entry.station);

  const settled = await Promise.allSettled(candidates.map((station) => fetchStation(station, lat, lon)));

  return settled
    .flatMap((result) => (result.status === 'fulfilled' && result.value ? [result.value] : []))
    .sort((a, b) => a.distanceKm - b.distanceKm);
};
