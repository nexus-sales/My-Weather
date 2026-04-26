export interface CityResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

export const searchCities = async (query: string): Promise<CityResult[]> => {
  if (!query || query.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
  
  const res = await fetch(url, {
    headers: {
      'Accept-Language': 'es,en', // Prefer Spanish/English results
    }
  });

  if (!res.ok) throw new Error('Failed to fetch cities');
  
  const data = await res.json();
  
  return data.map((item: any) => ({
    id: item.place_id.toString(),
    name: item.display_name.split(',')[0],
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    country: item.address?.country,
    state: item.address?.state || item.address?.region,
  }));
};

export const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
  
  const res = await fetch(url);
  if (!res.ok) return 'Unknown Location';
  
  const data = await res.json();
  const address = data.address;
  const city = address.city || address.town || address.village || address.hamlet || address.suburb || address.county || 'Ubicación';
  const country = address.country_code?.toUpperCase() || '';
  
  return `${city}${country ? `, ${country}` : ''}`;
};
