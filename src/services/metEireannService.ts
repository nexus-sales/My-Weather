export interface MetEireannForecast {
  isAvailable: boolean;
  source: string;
  updated?: string;
  nextHour?: {
    time: string;
    temp?: number;
    windSpeed?: number;
    windDirection?: number;
    precipitation?: number;
    humidity?: number;
    pressure?: number;
    cloudiness?: number;
    symbol?: string;
  };
}

export const isIrelandCoords = (lat: number, lon: number) =>
  lat >= 51.2 && lat <= 55.8 && lon >= -10.9 && lon <= -5.2;

const readNumber = (node: Element | null, attr: string) => {
  const raw = node?.getAttribute(attr);
  if (!raw) return undefined;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : undefined;
};

const findCurrentForecastNode = (doc: Document) => {
  const times = Array.from(doc.querySelectorAll('product > time'));
  const now = Date.now();

  return times.find((time) => {
    const from = Date.parse(time.getAttribute('from') ?? '');
    const to = Date.parse(time.getAttribute('to') ?? '');
    return Number.isFinite(from) && Number.isFinite(to) && from <= now && to >= now;
  }) ?? times.find((time) => {
    const from = Date.parse(time.getAttribute('from') ?? '');
    return Number.isFinite(from) && from > now;
  });
};

export const fetchMetEireannForecast = async (lat: number, lon: number): Promise<MetEireannForecast> => {
  if (!isIrelandCoords(lat, lon)) {
    return { isAvailable: false, source: 'Met Eireann' };
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  const res = await fetch(`/api/met-eireann?${params.toString()}`);
  if (!res.ok) {
    return { isAvailable: false, source: 'Met Eireann' };
  }

  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = doc.querySelector('parsererror');

  if (parserError) {
    return { isAvailable: false, source: 'Met Eireann' };
  }

  const time = findCurrentForecastNode(doc);
  const location = time?.querySelector('location') ?? null;

  if (!time || !location) {
    return { isAvailable: false, source: 'Met Eireann' };
  }

  return {
    isAvailable: true,
    source: 'Met Eireann',
    updated: doc.querySelector('meta > updated')?.textContent ?? undefined,
    nextHour: {
      time: time.getAttribute('from') ?? '',
      temp: readNumber(location.querySelector('temperature'), 'value'),
      windSpeed: readNumber(location.querySelector('windSpeed'), 'mps'),
      windDirection: readNumber(location.querySelector('windDirection'), 'deg'),
      precipitation: readNumber(location.querySelector('precipitation'), 'value'),
      humidity: readNumber(location.querySelector('humidity'), 'value'),
      pressure: readNumber(location.querySelector('pressure'), 'value'),
      cloudiness: readNumber(location.querySelector('cloudiness'), 'percent'),
      symbol: location.querySelector('symbol')?.getAttribute('id') ?? undefined,
    },
  };
};
