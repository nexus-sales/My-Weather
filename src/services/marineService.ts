export interface TidePoint {
  time: string;
  height: number;
  type: 'high' | 'low';
}

export interface MarineData {
  waveHeight: number;
  wavePeriod: number;
  seaTemperature: number;
  seaLevel: number;
  tideTrend: 'rising' | 'falling' | 'steady';
  nextTide?: TidePoint;
}

interface MarineApiResponse {
  hourly?: {
    time?: string[];
    wave_height?: Array<number | null>;
    wave_period?: Array<number | null>;
    sea_surface_temperature?: Array<number | null>;
    sea_level_height_msl?: Array<number | null>;
  };
}

const nearestIndex = (times: string[]) => {
  const now = Date.now();
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

const round = (value: number | null | undefined, decimals = 1) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const detectNextTide = (times: string[], levels: Array<number | null>, startIndex: number): TidePoint | undefined => {
  const limit = Math.min(levels.length - 1, startIndex + 48);

  for (let index = Math.max(1, startIndex + 1); index < limit; index += 1) {
    const previous = levels[index - 1];
    const current = levels[index];
    const next = levels[index + 1];

    if (previous == null || current == null || next == null) continue;

    if (current > previous && current > next) {
      return { time: times[index], height: round(current, 2), type: 'high' };
    }

    if (current < previous && current < next) {
      return { time: times[index], height: round(current, 2), type: 'low' };
    }
  }

  return undefined;
};

export const fetchMarineData = async (lat: number, lon: number): Promise<MarineData | null> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  const res = await fetch(`/api/marine?${params.toString()}`);
  if (!res.ok) return null;

  const data = (await res.json()) as MarineApiResponse;
  const hourly = data.hourly;
  const times = hourly?.time ?? [];

  if (times.length === 0) return null;

  const index = nearestIndex(times);
  const seaLevels = hourly?.sea_level_height_msl ?? [];
  const currentLevel = seaLevels[index];
  const previousLevel = seaLevels[Math.max(0, index - 1)];
  const levelDelta = typeof currentLevel === 'number' && typeof previousLevel === 'number'
    ? currentLevel - previousLevel
    : 0;

  return {
    waveHeight: round(hourly?.wave_height?.[index]),
    wavePeriod: round(hourly?.wave_period?.[index]),
    seaTemperature: round(hourly?.sea_surface_temperature?.[index]),
    seaLevel: round(currentLevel, 2),
    tideTrend: Math.abs(levelDelta) < 0.01 ? 'steady' : levelDelta > 0 ? 'rising' : 'falling',
    nextTide: detectNextTide(times, seaLevels, index),
  };
};
