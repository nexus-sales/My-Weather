export interface AemetAviso {
  id: string;
  nivel: 'amarillo' | 'naranja' | 'rojo' | 'verde';
  descripcion: string;
  comienzo: string;
  fin: string;
  provincia: string;
}

export const fetchAemetAlerts = async (): Promise<AemetAviso[]> => {
  try {
    const res = await fetch('/api/aemet?path=avisos_cap/ultimoelaborado/area/esp');
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // AEMET CAP format is complex, we'll simplify it for the UI
    // Note: The structure depends on what the AEMET API returns exactly.
    // Usually it's an array of alerts in the 'datos' field (after the proxy resolve)
    
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
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
