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

const fetchAlerts = async (country: string): Promise<MeteoAlert[]> => {
  const res = await fetch(`/api/meteoalarm?country=${country}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  const data = await res.json();
  return data.alerts ?? [];
};

export const useAlerts = (country = 'es') => {
  return useQuery({
    queryKey: ['alerts', country],
    queryFn: () => fetchAlerts(country),
    staleTime: 30 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};
