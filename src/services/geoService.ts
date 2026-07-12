export interface CityResult {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
}

interface NominatimSearchItem {
  place_id: number | string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    country?: string;
    state?: string;
    region?: string;
  };
}

interface NominatimReverseResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    country_code?: string;
  };
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
  
  const data = (await res.json()) as NominatimSearchItem[];
  
  return data.map((item) => ({
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

  const data = (await res.json()) as NominatimReverseResponse;
  const address = data.address ?? {};
  const city = address.city || address.town || address.village || address.hamlet || address.suburb || address.county || 'Ubicación';
  const country = address.country_code?.toUpperCase() || '';

  return `${city}${country ? `, ${country}` : ''}`;
};

/** ISO 3166-1 alpha-2 country code (lowercase) for a coordinate, or null if it can't be resolved. */
export const getCountryCode = async (lat: number, lon: number): Promise<string | null> => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = (await res.json()) as NominatimReverseResponse;
  return data.address?.country_code?.toLowerCase() ?? null;
};
