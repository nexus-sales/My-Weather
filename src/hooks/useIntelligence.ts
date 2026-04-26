import { useQuery } from '@tanstack/react-query';
import { useLocationStore } from '@/store/useLocationStore';
import { useAlerts } from './useAlerts';

type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'extreme';

interface LightningResponse {
  convective?: {
    current?: {
      cape?: number;
      liftedIndex?: number;
      risk?: RiskLevel;
      isThunderstorm?: boolean;
    };
  };
  strikes?: unknown;
  blitzortungActive?: boolean;
}

interface AirQualityResponse {
  hourly?: {
    time?: string[];
    european_aqi?: number[];
    pm10?: number[];
    pm2_5?: number[];
    dust?: number[];
    uv_index?: number[];
  };
}

interface MarineResponse {
  hourly?: {
    time?: string[];
    wave_height?: number[];
    wave_period?: number[];
    sea_surface_temperature?: number[];
  };
}

const fetchJson = async <T>(path: string): Promise<T> => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
};

export const useLightning = () => {
  const { coords } = useLocationStore();

  return useQuery({
    queryKey: ['lightning', coords.lat, coords.lon],
    queryFn: () => fetchJson<LightningResponse>(`/api/lightning?lat=${coords.lat}&lon=${coords.lon}`),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 30 * 60 * 1000,
  });
};

export const useAirQuality = () => {
  const { coords } = useLocationStore();

  return useQuery({
    queryKey: ['airquality', coords.lat, coords.lon],
    queryFn: () => fetchJson<AirQualityResponse>(`/api/airquality?lat=${coords.lat}&lon=${coords.lon}`),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 60 * 60 * 1000,
  });
};

export const useMarine = () => {
  const { coords } = useLocationStore();

  return useQuery({
    queryKey: ['marine', coords.lat, coords.lon],
    queryFn: () => fetchJson<MarineResponse>(`/api/marine?lat=${coords.lat}&lon=${coords.lon}`),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
};

export const useWeatherIntelligence = () => {
  const alerts = useAlerts('es');
  const lightning = useLightning();
  const airQuality = useAirQuality();
  const marine = useMarine();

  return {
    alerts,
    lightning,
    airQuality,
    marine,
  };
};
