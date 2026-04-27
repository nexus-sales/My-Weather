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
  try {
    const res = await fetch('/api/aemet?path=observacion/radar/2d/comun/nacional');
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
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const fetchAemetCoastalForecast = async (area = 'esp'): Promise<AemetCoastal | null> => {
  try {
    const res = await fetch(`/api/aemet?path=prediccion/maritima/costera/area/${area}`);
    if (!res.ok) return null;
    const data = await res.json();
    // AEMET returns coastal as an array or object depending on area
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
