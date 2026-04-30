import { useQuery } from '@tanstack/react-query';

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

const fetchAlerts = async (country: string, query?: string): Promise<MeteoAlert[]> => {
  const url = `/api/meteoalarm?country=${country}${query ? `&query=${encodeURIComponent(query)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const data = await res.json();
  return data.alerts ?? [];
};

export const useAlerts = (country = 'es', query?: string) => {
  return useQuery({
    queryKey: ['alerts', country, query],
    queryFn: () => fetchAlerts(country, query),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};
