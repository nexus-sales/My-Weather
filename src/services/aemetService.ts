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

export const fetchAemetAlerts = async (): Promise<AemetAviso[]> => {
  try {
    const res = await fetch('/api/aemet?path=avisos_cap/ultimoelaborado/area/esp');
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return (data as AemetAvisoApiItem[]).map((item) => ({
      id: item.id || Math.random().toString(),
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
  const paths = [
    'observacion/radar/2d/nacional',
    'observacion/radar/2d/comun/nacional',
    'observacion/radar/nacional'
  ];

  for (const path of paths) {
    try {
      const res = await fetch(`/api/aemet?path=${path}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn(`Radar path ${path} failed`, e);
    }
  }
  return [];
};

export const fetchAemetStations = async (): Promise<AemetStation[]> => {
  try {
    const res = await fetch('/api/aemet?path=observacion/convencional/todas');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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
  else if (lat < 38 && lon > 1) code = '46'; // Baleares
  else if (lat < 37 && lon < -5) code = '45'; // And. Occ
  else if (lat < 37 && lon > -5 && lon < -1) code = '44'; // And. Or
  else if (lat > 37 && lat < 41 && lon > -1) code = '43'; // Valencia/Murcia

  try {
    const res = await fetch(`/api/aemet?path=prediccion/maritima/costera/costa/${code}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  } catch {
    return null;
  }
};

export const fetchAemetModelProduct = async (municipioId: string): Promise<any> => {
  try {
    const res = await fetch(`/api/aemet?path=prediccion/especifica/municipio/diaria/${municipioId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};
