export interface AemetRadar {
  nombre: string;
  url: string;
}

export interface AemetStation {
  idema: string;
  lon: number;
  lat: number;
  alt: number;
  ubi: string;
  ta: number; // air temp
  vvm?: number; // wind speed
  vv?: number; // wind speed as returned by AEMET observations
  vmax?: number; // max wind speed
  dv?: number; // wind dir
  hr?: number; // humidity
  pres?: number; // pressure
  prec?: number; // precipitation
  fint: string; // observation time
}

export interface AemetCoastal {
  nombre: string;
  texto: string;
  validez: string;
}

const dmsToDecimal = (dms: string): number => {
  if (!dms) return 0;
  // Format: DDMMSS[NSEW]
  const match = dms.match(/(\d{2,3})(\d{2})(\d{2})([NSEW])/);
  if (!match) return 0;
  
  const [, d, m, s, dir] = match;
  let dec = parseInt(d) + parseInt(m) / 60 + parseInt(s) / 3600;
  if (dir === 'S' || dir === 'W') dec = -dec;
  return dec;
};

export const fetchAemetRadar = async (): Promise<AemetRadar[]> => {
  try {
    const res = await fetch('/api/aemet?path=__radar_probe__');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const fetchAemetStations = async (): Promise<AemetStation[]> => {
  try {
    const res = await fetch('/api/aemet?path=observacion/convencional/todas');
    if (!res.ok) return [];
    const rawData = await res.json();
    if (!Array.isArray(rawData)) return [];

    // Map and parse AEMET's weird coordinate format
    const stations = rawData.map((s: AemetStation) => ({
      idema: s.idema,
      lat: typeof s.lat === 'string' ? dmsToDecimal(s.lat) : s.lat,
      lon: typeof s.lon === 'string' ? dmsToDecimal(s.lon) : s.lon,
      alt: s.alt,
      ubi: s.ubi,
      ta: s.ta,
      vvm: s.vvm ?? s.vv,
      vv: s.vv,
      vmax: s.vmax,
      dv: s.dv,
      hr: s.hr,
      pres: s.pres,
      prec: s.prec,
      fint: s.fint
    }));

    const latestByStation = new Map<string, AemetStation>();
    stations.forEach((station) => {
      if (!station.idema || !Number.isFinite(station.lat) || !Number.isFinite(station.lon)) return;

      const current = latestByStation.get(station.idema);
      if (!current || new Date(station.fint).getTime() > new Date(current.fint).getTime()) {
        latestByStation.set(station.idema, station);
      }
    });

    return [...latestByStation.values()];
  } catch {
    return [];
  }
};

export const fetchAemetCoastalForecast = async (lat: number, lon: number): Promise<AemetCoastal | null> => {
  // AEMET coastal codes: 40: Galicia, 41: Cantabrico, 42: Cataluña, 43: Valencia/Murcia,
  // 44: And. Or, 45: And. Occ, 46: Baleares, 47: Canarias
  let code = '42'; // default Cataluña
  if (lat > 42 && lon < -7) code = '40'; // Galicia
  else if (lat > 43 && lon > -7 && lon < -1) code = '41'; // Cantabrico
  else if (lat < 30) code = '47'; // Canarias
  else if (lat > 38 && lat < 40.5 && lon > 1) code = '46'; // Baleares (Corrected lat)
  else if (lat < 37 && lon < -5) code = '45'; // And. Occ
  else if (lat < 37 && lon > -5 && lon < -1) code = '44'; // And. Or
  else if (lat > 37 && lat < 41 && lon > -1) code = '43'; // Valencia/Murcia

  try {
    const res = await fetch(`/api/aemet?path=prediccion/maritima/costera/costa/${code}`);
    if (!res.ok) return null;
    const data = await res.json();
    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return null;
    return {
      nombre: item.nombre ?? item.situacion?.nombre ?? '',
      texto: item.situacion?.texto ?? item.aviso?.texto ?? '',
      validez: item.situacion?.fin ?? item.origen?.fin ?? '',
    };
  } catch {
    return null;
  }
};

export const fetchAemetModelProduct = async (municipioId: string): Promise<unknown> => {
  try {
    const res = await fetch(`/api/aemet?path=prediccion/especifica/municipio/diaria/${municipioId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
