import { useQuery } from '@tanstack/react-query';
import { useLocationStore } from '@/store/useLocationStore';
import { usePWSStore } from '@/store/usePWSStore';

export interface PWSObservation {
  stationID: string;
  obsTimeUtc: string;
  neighborhood: string;
  softwareType: string | null;
  country: string;
  lat: number;
  lon: number;
  metric: {
    temp: number;
    dewpt: number;
    heatIndex: number;
    windChill: number;
    windSpeed: number;
    windGust: number;
    pressure: number;
    precipRate: number;
    precipTotal: number;
    elev: number;
  };
  humidity: number;
  winddir: number;
  uv: number;
  solarRadiation: number;
  qcStatus: number;
}

const fetchPWSNearby = async (lat: number, lon: number, limit: number): Promise<PWSObservation[]> => {
  const params = new URLSearchParams({
    endpoint: 'observations/nearby',
    geocode: `${lat},${lon}`,
    limit: limit.toString(),
  });
  const res = await fetch(`/api/wu?${params}`);
  if (!res.ok) throw new Error('Failed to fetch PWS stations');
  const data = await res.json();
  return data.observations ?? [];
};

const fetchPWSById = async (stationId: string): Promise<PWSObservation | null> => {
  const params = new URLSearchParams({
    endpoint: 'observations/current',
    stationId,
  });
  const res = await fetch(`/api/wu?${params}`);
  if (!res.ok) throw new Error(`Failed to fetch station ${stationId}`);
  const data = await res.json();
  return data.observations?.[0] ?? null;
};

export const usePWSNearby = (limit = 15) => {
  const { coords } = useLocationStore();
  const { autoRefresh, refreshIntervalMin } = usePWSStore();

  return useQuery({
    queryKey: ['pws-nearby', coords.lat, coords.lon, limit],
    queryFn: () => fetchPWSNearby(coords.lat, coords.lon, limit),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 5 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshIntervalMin * 60 * 1000 : false,
  });
};

export const usePWSStation = (stationId: string | null) => {
  const { autoRefresh, refreshIntervalMin } = usePWSStore();

  return useQuery({
    queryKey: ['pws-station', stationId],
    queryFn: () => fetchPWSById(stationId!),
    enabled: !!stationId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: autoRefresh ? refreshIntervalMin * 60 * 1000 : false,
  });
};
