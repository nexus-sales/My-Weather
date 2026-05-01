export interface AemetAviso {
  id: string;
  nivel: 'amarillo' | 'naranja' | 'rojo' | 'verde';
  descripcion: string;
  comienzo: string;
  fin: string;
  provincia: string;
}

interface AemetAvisoApiItem {
  id?: string;
  nivel?: AemetAviso['nivel'];
  descripcion?: string;
  texto?: string;
  comienzo?: string;
  fin?: string;
  provincia?: string;
}

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
  
  const [_, d, m, s, dir] = match;
  let dec = parseInt(d) + parseInt(m) / 60 + parseInt(s) / 3600;
  if (dir === 'S' || dir === 'W') dec = -dec;
  return dec;
};

export const fetchAemetAlerts = async (): Promise<AemetAviso[]> => {
  try {
    const res = await fetch('/api/aemet?path=avisos_cap/ultimoelaborado/area/esp');
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return (data as AemetAvisoApiItem[]).map((item) => ({
      id: item.id || crypto.randomUUID(),
      nivel: item.nivel || 'amarillo',
      descripcion: item.descripcion || item.texto || 'Aviso meteorológico',
      comienzo: item.comienzo || '',
      fin: item.fin || '',
      provincia: item.provincia || 'España'
    }));
  } catch (error) {
    console.error('Error fetching AEMET alerts:', error);
    return [];
  }
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
    return rawData.map((s: AemetStation) => ({
      idema: s.idema,
      lat: typeof s.lat === 'string' ? dmsToDecimal(s.lat) : s.lat,
      lon: typeof s.lon === 'string' ? dmsToDecimal(s.lon) : s.lon,
      alt: s.alt,
      ubi: s.ubi,
      ta: s.ta,
      vvm: s.vvm,
      dv: s.dv,
      hr: s.hr,
      pres: s.pres,
      prec: s.prec,
      fint: s.fint
    }));
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
