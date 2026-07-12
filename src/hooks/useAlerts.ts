import { useQuery } from '@tanstack/react-query';
import { getCountryCode } from '@/services/geoService';

export interface MeteoAlert {
  id: string;
  title: string;
  summary: string;
  updated: string;
  effective: string;
  expires: string;
  severity: string;
  urgency: string;
  certainty: string;
  event: string;
  area: string;
}

// Countries covered by the Meteoalarm feed proxied through /api/meteoalarm.
const SUPPORTED_COUNTRIES = new Set(['es', 'de', 'fr', 'it', 'pt', 'nl', 'be']);

export const ALERTS_COUNTRY_NAMES: Record<string, { es: string; en: string }> = {
  es: { es: 'España', en: 'Spain' },
  de: { es: 'Alemania', en: 'Germany' },
  fr: { es: 'Francia', en: 'France' },
  it: { es: 'Italia', en: 'Italy' },
  pt: { es: 'Portugal', en: 'Portugal' },
  nl: { es: 'Países Bajos', en: 'Netherlands' },
  be: { es: 'Bélgica', en: 'Belgium' },
};

const fetchAlerts = async (country: string): Promise<MeteoAlert[]> => {
  const res = await fetch(`/api/meteoalarm?country=${country}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const data = await res.json();
  return data.alerts ?? [];
};

/** Official Meteoalarm alerts for whichever of the 7 covered countries the coordinates fall in. */
export const useAlerts = (lat: number, lon: number) => {
  const { data: countryCode } = useQuery({
    queryKey: ['alerts-country', Math.round(lat * 10) / 10, Math.round(lon * 10) / 10],
    queryFn: () => getCountryCode(lat, lon),
    enabled: !!lat && !!lon,
    staleTime: 6 * 60 * 60 * 1000,
  });

  const country = countryCode && SUPPORTED_COUNTRIES.has(countryCode) ? countryCode : null;

  const query = useQuery({
    queryKey: ['alerts', country],
    queryFn: () => fetchAlerts(country as string),
    enabled: !!country,
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });

  // Exposed so callers can be explicit that these alerts are country-wide, not
  // filtered to the user's exact area — the feed has no finer-grained query.
  return { ...query, country };
};
