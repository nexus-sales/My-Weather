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
  lat >= 51.0 && lat <= 56.0 && lon >= -11.0 && lon <= -5.0;

const readNumber = (node: Element | null, attr: string) => {
  const raw = node?.getAttribute(attr);
  if (!raw) return undefined;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : undefined;
};

const findTargetTime = (doc: Document) => {
  const times = Array.from(doc.getElementsByTagName('time'));
  const now = Date.now();

  // Find the closest "from" time that is currently valid or in the near future
  const current = times.find((time) => {
    const fromStr = time.getAttribute('from');
    const animatedTo = time.getAttribute('to');
    if (!fromStr || !animatedTo) return false;
    
    const from = Date.parse(fromStr);
    const to = Date.parse(animatedTo);
    return Number.isFinite(from) && Number.isFinite(to) && from <= now && to >= now;
  });

  if (current) return current.getAttribute('from');

  const future = times.find((time) => {
    const fromStr = time.getAttribute('from');
    if (!fromStr) return false;
    const from = Date.parse(fromStr);
    return Number.isFinite(from) && from > now;
  });

  return future?.getAttribute('from');
};

export const fetchMetEireannForecast = async (lat: number, lon: number): Promise<MetEireannForecast> => {
  if (!isIrelandCoords(lat, lon)) {
    return { isAvailable: false, source: 'Met Eireann' };
  }

  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
  });

  try {
    const res = await fetch(`/api/met-eireann?${params.toString()}`);
    if (!res.ok) return { isAvailable: false, source: 'Met Eireann' };

    const xml = await res.text();
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    
    if (doc.getElementsByTagName('parsererror').length > 0) {
      return { isAvailable: false, source: 'Met Eireann' };
    }

    const targetFrom = findTargetTime(doc);
    if (!targetFrom) return { isAvailable: false, source: 'Met Eireann' };

    // Collect all nodes for this target "from" time
    const allTimes = Array.from(doc.getElementsByTagName('time'));
    const nodes = allTimes.filter(t => t.getAttribute('from') === targetFrom);
    const data: Partial<NonNullable<MetEireannForecast['nextHour']>> = {};

    nodes.forEach((node) => {
      const location = node.getElementsByTagName('location')[0];
      if (!location) return;

      const temp = location.getElementsByTagName('temperature')[0];
      if (temp) data.temp = readNumber(temp, 'value');

      const windSpeed = location.getElementsByTagName('windSpeed')[0];
      if (windSpeed) data.windSpeed = readNumber(windSpeed, 'mps');

      const windDir = location.getElementsByTagName('windDirection')[0];
      if (windDir) data.windDirection = readNumber(windDir, 'deg');

      const precip = location.getElementsByTagName('precipitation')[0];
      if (precip) data.precipitation = readNumber(precip, 'value');

      const hum = location.getElementsByTagName('humidity')[0];
      if (hum) data.humidity = readNumber(hum, 'value');

      const press = location.getElementsByTagName('pressure')[0];
      if (press) data.pressure = readNumber(press, 'value');

      const cloud = location.getElementsByTagName('cloudiness')[0];
      if (cloud) data.cloudiness = readNumber(cloud, 'percent');

      const sym = location.getElementsByTagName('symbol')[0];
      if (sym) data.symbol = sym.getAttribute('id') ?? undefined;
    });

    if (Object.keys(data).length === 0) return { isAvailable: false, source: 'Met Eireann' };

    return {
      isAvailable: true,
      source: 'Met Eireann',
      updated: doc.getElementsByTagName('updated')[0]?.textContent ?? undefined,
      nextHour: {
        time: targetFrom,
        ...data,
      },
    };
  } catch (err) {
    console.error('Met Eireann fetch error:', err);
    return { isAvailable: false, source: 'Met Eireann' };
  }
};
