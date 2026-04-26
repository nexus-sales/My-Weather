import { useQuery } from '@tanstack/react-query';
import { fetchWeatherHistory } from '@/services/weatherService';
import { useLocationStore } from '@/store/useLocationStore';

export const useWeatherHistory = () => {
  const { coords } = useLocationStore();

  return useQuery({
    queryKey: ['weather-history', coords.lat, coords.lon],
    queryFn: () => fetchWeatherHistory(coords.lat, coords.lon),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });
};
