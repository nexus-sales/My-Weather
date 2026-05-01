import { useQuery } from '@tanstack/react-query';
import { fetchWeather } from '@/services/weatherService';
import { useLocationStore } from '@/store/useLocationStore';

export const useWeather = () => {
  const { coords, units } = useLocationStore();

  return useQuery({
    queryKey: ['weather', coords.lat, coords.lon, units],
    queryFn: () => fetchWeather(coords.lat, coords.lon, units),
    enabled: !!coords.lat && !!coords.lon,
    staleTime: 5 * 60 * 1000,       // Data is fresh for 5 min
    refetchInterval: 10 * 60 * 1000, // Background refresh every 10 min
  });
};
